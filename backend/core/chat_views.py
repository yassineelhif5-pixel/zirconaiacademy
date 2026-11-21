from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from .ai import AIConfigurationError, AIProviderError, generate_answer

class ChatSerializer(serializers.Serializer):
    message=serializers.CharField(max_length=3000,trim_whitespace=True)
    history=serializers.ListField(child=serializers.DictField(),required=False,allow_empty=True,max_length=8)

class ChatView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    throttle_scope="chat"
    def post(self,request):
        serializer=ChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            answer=generate_answer(serializer.validated_data["message"],serializer.validated_data.get("history",[]))
            return Response({"answer":answer})
        except AIConfigurationError as exc:
            return Response({"detail":str(exc),"code":"ai_not_configured"},status=503)
        except AIProviderError as exc:
            return Response({"detail":str(exc),"code":"ai_unavailable"},status=502)
