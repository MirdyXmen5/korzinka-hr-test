from rest_framework import serializers
from .models import Test, Question, TestResult, Answer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'order']

class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'correct_answers', 'order']

class TestListSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    
    class Meta:
        model = Test
        fields = ['id', 'name', 'language', 'language_display', 'question_count', 'created_at']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_answer', 'is_correct']

class AnswerDetailSerializer(serializers.ModelSerializer):
    question = QuestionWithAnswerSerializer(read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_answer', 'is_correct']

class TestResultListSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='test.name', read_only=True)
    test_language = serializers.CharField(source='test.get_language_display', read_only=True)
    score_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = TestResult
        fields = ['id', 'test', 'test_name', 'test_language', 'full_name', 'position', 
                  'date', 'timer_minutes', 'correct_count', 'incorrect_count', 
                  'total_questions', 'score_percent', 'started_at', 'finished_at']
    
    def get_score_percent(self, obj):
        if obj.total_questions == 0:
            return 0
        return round((obj.correct_count / obj.total_questions) * 100, 1)

class TestResultDetailSerializer(TestResultListSerializer):
    answers = AnswerDetailSerializer(many=True, read_only=True)
    
    class Meta(TestResultListSerializer.Meta):
        fields = TestResultListSerializer.Meta.fields + ['answers']

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_answer = serializers.CharField(max_length=10)

class SubmitResultSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    full_name = serializers.CharField(max_length=255)
    position = serializers.CharField(max_length=255)
    timer_minutes = serializers.IntegerField(required=False, allow_null=True)
    started_at = serializers.DateTimeField()
    answers = SubmitAnswerSerializer(many=True)
