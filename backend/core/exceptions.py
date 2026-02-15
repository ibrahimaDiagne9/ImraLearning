from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardizes error responses across the API.
    Returns:
    {
        "success": False,
        "message": "Human readable error message",
        "code": "error_code",
        "errors": { ... field specific errors ... }
    }
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # If the default handler didn't return a response (e.g. unexpected error),
    # we handle it manually if we want to provide a 500 response.
    if response is None:
        logger.exception("Unexpected server error")
        return Response({
            "success": False,
            "message": "An unexpected server error occurred.",
            "code": "server_error"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Standardize the structure for DRF built-in exceptions
    formatted_data = {
        "success": False,
        "message": "Validation or processing error",
        "code": getattr(exc, 'default_code', 'error'),
        "errors": response.data
    }

    # Improve human-readability for common cases
    if response.status_code == 404:
        formatted_data["message"] = "The requested resource was not found."
        formatted_data["code"] = "not_found"
    elif response.status_code == 403:
        formatted_data["message"] = "You do not have permission to perform this action."
        formatted_data["code"] = "permission_denied"
    elif response.status_code == 401:
        formatted_data["message"] = "Authentication credentials were not provided or are invalid."
        formatted_data["code"] = "not_authenticated"
    elif response.status_code == 400:
        # If it's a validation error, extract a generic message if possible
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                formatted_data["message"] = str(response.data['detail'])
            elif 'non_field_errors' in response.data:
                formatted_data["message"] = str(response.data['non_field_errors'][0])
            else:
                formatted_data["message"] = "Please correct the errors below."
        elif isinstance(response.data, list):
             formatted_data["message"] = str(response.data[0])

    response.data = formatted_data
    return response
