from django.contrib import admin

from .models import ChatMessage, Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "created_at")
    search_fields = ("username",)
    ordering = ("id",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "short_content", "created_at")
    search_fields = ("member__username", "content")
    list_select_related = ("member",)
    ordering = ("id",)

    def short_content(self, obj):
        if not obj.content:
            return ""
        if len(obj.content) <= 50:
            return obj.content
        return f"{obj.content[:50]}..."

    short_content.short_description = "Content"
