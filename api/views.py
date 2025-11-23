from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, Member, MemberToken
from .serializers import (
    ChatMessageSerializer,
    LoginSerializer,
    MemberRegisterSerializer,
    MemberSerializer,
    MessageSerializer,
)


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: MessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=MemberRegisterSerializer,
        responses={
            201: MemberSerializer,
        },
        description="Register a new member and obtain an authentication token.",
    )
    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()

        token, created = MemberToken.objects.get_or_create(
            member=member,
            defaults={"key": MemberToken.generate_key()},
        )

        member_data = MemberSerializer(member).data
        response_data = {"token": token.key, "member": member_data}
        return Response(response_data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: MemberSerializer},
        description="Log in an existing member and obtain an authentication token.",
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.validated_data["member"]

        token, created = MemberToken.objects.get_or_create(
            member=member,
            defaults={"key": MemberToken.generate_key()},
        )

        member_data = MemberSerializer(member).data
        response_data = {"token": token.key, "member": member_data}
        return Response(response_data, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer},
        description="Return the currently authenticated member.",
    )
    def get(self, request):
        member = request.user
        data = MemberSerializer(member).data
        return Response(data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer},
        description="Retrieve the profile of the authenticated member.",
    )
    def get(self, request):
        member = request.user
        data = MemberSerializer(member).data
        return Response(data, status=status.HTTP_200_OK)

    @extend_schema(
        request=None,
        responses={200: MemberSerializer},
        description=(
            "Update the profile of the authenticated member. "
            "Only the username field can be updated."
        ),
    )
    def put(self, request):
        return self._update_username(request)

    @extend_schema(
        request=None,
        responses={200: MemberSerializer},
        description=(
            "Partially update the profile of the authenticated member. "
            "Only the username field can be updated."
        ),
    )
    def patch(self, request):
        return self._update_username(request, partial=True)

    def _update_username(self, request, partial: bool = False):
        member: Member = request.user
        username = request.data.get("username")

        if not username:
            return Response(
                {"username": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            Member.objects.exclude(id=member.id)
            .filter(username=username)
            .exists()
        ):
            return Response(
                {"username": ["A member with this username already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        member.username = username
        member.save(update_fields=["username"])

        data = MemberSerializer(member).data
        return Response(data, status=status.HTTP_200_OK)


class ChatMessageListCreateView(generics.ListCreateAPIView):
    queryset = ChatMessage.objects.select_related("member").order_by("created_at")
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: ChatMessageSerializer(many=True)},
        description="List all chat messages in chronological order.",
    )
    def get(self, request, *args, **kwargs):  # type: ignore[override]
        return super().get(request, *args, **kwargs)

    @extend_schema(
        request=ChatMessageSerializer,
        responses={201: ChatMessageSerializer},
        description="Create a new chat message as the authenticated member.",
    )
    def post(self, request, *args, **kwargs):  # type: ignore[override]
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)
