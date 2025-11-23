from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from .models import ChatMessage, Member


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "username", "created_at"]
        read_only_fields = ["id", "username", "created_at"]


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = Member
        fields = ["username", "password"]

    def validate_username(self, value: str) -> str:
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("A member with this username already exists.")
        return value

    def create(self, validated_data):
        raw_password = validated_data.get("password")
        validated_data["password"] = make_password(raw_password)
        return super().create(validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password.")

        if not check_password(password, member.password):
            raise serializers.ValidationError("Invalid username or password.")

        attrs["member"] = member
        return attrs


class ChatMessageSerializer(serializers.ModelSerializer):
    member = serializers.PrimaryKeyRelatedField(read_only=True)
    member_username = serializers.CharField(source="member.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "member", "member_username", "content", "created_at"]
        read_only_fields = ["id", "member", "member_username", "created_at"]
