from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Test, Question, TestResult, Answer
from .serializers import *
from .utils import parse_excel

class TestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestListSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        from django.db.models import Count
        return qs.annotate(question_count=Count('questions'))
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        test = self.get_object()
        questions = test.questions.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UploadTestView(generics.CreateAPIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file.name.endswith(('.xlsx', '.xls')):
            return Response({'error': 'Only Excel files (.xlsx, .xls) are supported'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        test_name = request.data.get('name', '').strip()
        language = request.data.get('language', '').strip()
        import_all_sheets = request.data.get('import_all_sheets', 'false').lower() == 'true'
        
        try:
            if import_all_sheets:
                tests = parse_excel(file, test_name=None, language=None)
            elif test_name and language:
                tests = parse_excel(file, test_name=test_name, language=language)
            else:
                return Response(
                    {'error': 'Provide test name and language, or set import_all_sheets=true'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from django.db.models import Count
            test_ids = [t.id for t in tests]
            tests_qs = Test.objects.filter(id__in=test_ids).annotate(question_count=Count('questions'))
            serializer = TestListSerializer(tests_qs, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to parse Excel: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)

class ResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.select_related('test').prefetch_related('answers__question').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['test', 'date']
    search_fields = ['full_name', 'test__name', 'position']
    ordering_fields = ['date', 'finished_at', 'correct_count']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TestResultDetailSerializer
        return TestResultListSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = SubmitResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        try:
            test = Test.objects.get(id=data['test_id'])
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
        
        correct_count = 0
        incorrect_count = 0
        answer_objects = []
        
        questions = {q.id: q for q in test.questions.all()}
        
        for ans in data['answers']:
            question = questions.get(ans['question_id'])
            if not question:
                continue
            
            selected = ans['selected_answer'].upper()
            correct = question.correct_answers.upper()
            is_correct = set(selected.split(',')) == set(correct.split(','))
            
            if is_correct:
                correct_count += 1
            else:
                incorrect_count += 1
            
            answer_objects.append({
                'question': question,
                'selected_answer': selected,
                'is_correct': is_correct
            })
        
        result = TestResult.objects.create(
            test=test,
            full_name=data['full_name'],
            position=data['position'],
            timer_minutes=data.get('timer_minutes'),
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            total_questions=len(questions),
            started_at=data['started_at']
        )
        
        Answer.objects.bulk_create([
            Answer(
                result=result,
                question=ao['question'],
                selected_answer=ao['selected_answer'],
                is_correct=ao['is_correct']
            ) for ao in answer_objects
        ])
        
        result_serializer = TestResultDetailSerializer(result)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
