from django.db import models


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.username


class ChatMessage(models.Model):
    member = models.ForeignKey(
        "Member",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        content_preview = self.content[:30]
        if len(self.content) > 30:
            content_preview = f"{content_preview}..."
        return f"{self.member.username}: {content_preview}"
