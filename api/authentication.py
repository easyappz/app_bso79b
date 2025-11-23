from typing import Optional, Tuple

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.request import Request
from rest_framework.exceptions import AuthenticationFailed

from .models import Member, MemberToken


class MemberTokenAuthentication(BaseAuthentication):
    """Simple token authentication for the Member model.

    The client should authenticate by passing the token key in the
    "Authorization" HTTP header, prefixed with the string "Token ".

        Authorization: Token 1234567890abcdef...
    """

    keyword = "Token"

    def authenticate(self, request: Request) -> Optional[Tuple[Member, MemberToken]]:  # type: ignore[override]
        auth = get_authorization_header(request).split()

        if not auth:
            return None

        if auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            raise AuthenticationFailed("Invalid token header. No credentials provided.")
        if len(auth) > 2:
            raise AuthenticationFailed(
                "Invalid token header. Token string should not contain spaces.",
            )

        try:
            key = auth[1].decode()
        except UnicodeError:
            raise AuthenticationFailed(
                "Invalid token header. Token string should not contain invalid characters.",
            )

        try:
            token = MemberToken.objects.select_related("member").get(key=key)
        except MemberToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")

        return token.member, token
