from django.db import models

class Test(models.Model):
    name = models.CharField(max_length=255)
    language = models.CharField(max_length=2, choices=[('ru', 'Русский'), ('kk', 'Қазақша')])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_language_display()})"
    


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    option_a = models.TextField()
    option_b = models.TextField()
    option_c = models.TextField()
    correct_answers = models.CharField(max_length=10, default='A')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}"

class TestResult(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='results')
    full_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    timer_minutes = models.PositiveIntegerField(null=True, blank=True)
    correct_count = models.PositiveIntegerField(default=0)
    incorrect_count = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-finished_at']
    
    def __str__(self):
        return f"{self.full_name} — {self.test.name} ({self.correct_count}/{self.total_questions})"

class Answer(models.Model):
    result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.CharField(max_length=10)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.question.text[:30]} -> {self.selected_answer} ({'V' if self.is_correct else 'X'})"
