import mimetypes
import os
import re
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.utils.http import http_date
from django.views import View

class SecureMediaView(View):
    """
    Standard Django 'serve' doesn't always handle Range requests or CORS correctly 
    in production environments like Railway. This view ensures:
    1. Range request support (seeking/streaming)
    2. Explicit CORS headers for imraedu.com
    3. Correct MIME types for videos
    """
    
    def get(self, request, path):
        # Resolve the full system path
        full_path = os.path.join(settings.MEDIA_ROOT, path)
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            raise Http404("File not found.")

        # Determine file info
        file_size = os.path.getsize(full_path)
        content_type, _ = mimetypes.guess_type(full_path)
        content_type = content_type or 'application/octet-stream'
        
        # Handle Range Requests (important for video seeking)
        range_header = request.META.get('HTTP_RANGE', '').strip()
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header) if range_header else None
        
        response = None
        if range_match:
            first_byte, last_byte = range_match.groups()
            first_byte = int(first_byte)
            last_byte = int(last_byte) if last_byte else file_size - 1
            
            if first_byte >= file_size:
                return HttpResponse(status=416) # Requested Range Not Satisfiable
                
            length = last_byte - first_byte + 1
            
            # Using binary read to stream partial content
            with open(full_path, 'rb') as f:
                f.seek(first_byte)
                data = f.read(length)
                
            response = HttpResponse(data, status=206, content_type=content_type)
            response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{file_size}'
            response['Accept-Ranges'] = 'bytes'
            response['Content-Length'] = str(length)
        else:
            # Standard full file response
            response = FileResponse(open(full_path, 'rb'), content_type=content_type)
            response['Content-Length'] = str(file_size)
            response['Accept-Ranges'] = 'bytes'

        # Explicit CORS headers for production
        origin = request.META.get('HTTP_ORIGIN')
        allowed_origins = [
            'https://imraedu.com', 
            'https://www.imraedu.com', 
            'http://localhost:5173', 
            'http://localhost:5174'
        ]
        
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Range, Authorization, Content-Type'
            response['Access-Control-Expose-Headers'] = 'Content-Range, Accept-Ranges, Content-Length'

        # Cache control for media
        response['Last-Modified'] = http_date(os.path.getmtime(full_path))
        
        return response

    def options(self, request, *args, **kwargs):
        """Handle CORS pre-flight if needed."""
        response = HttpResponse()
        origin = request.META.get('HTTP_ORIGIN')
        allowed_origins = [
            'https://imraedu.com', 
            'https://www.imraedu.com', 
            'http://localhost:5173', 
            'http://localhost:5174'
        ]
        
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Range, Authorization, Content-Type'
            response['Access-Control-Max-Age'] = '86400'
            
        return response
