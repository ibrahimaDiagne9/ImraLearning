from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from django.utils.http import http_date
from django.views import View
import mimetypes
import os
import re

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

        # Force correct types for common video formats
        if full_path.endswith('.mp4'):
            content_type = 'video/mp4'
        elif full_path.endswith('.m4v'):
            content_type = 'video/mp4'
        elif full_path.endswith('.webm'):
            content_type = 'video/webm'
        
        # Handle Range Requests (important for video seeking)
        range_header = request.META.get('HTTP_RANGE', '').strip()
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header) if range_header else None
        
        if range_match:
            first_byte, last_byte = range_match.groups()
            first_byte = int(first_byte)
            last_byte = int(last_byte) if last_byte else file_size - 1
            
            if first_byte >= file_size:
                return HttpResponse(status=416) # Requested Range Not Satisfiable
                
            length = last_byte - first_byte + 1
            
            def file_iterator(path, offset, size):
                with open(path, 'rb') as f:
                    f.seek(offset)
                    remaining = size
                    while remaining > 0:
                        chunk_size = min(remaining, 8192)
                        data = f.read(chunk_size)
                        if not data:
                            break
                        yield data
                        remaining -= len(data)

            response = StreamingHttpResponse(file_iterator(full_path, first_byte, length), status=206, content_type=content_type)
            response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{file_size}'
            response['Accept-Ranges'] = 'bytes'
            response['Content-Length'] = str(length)
        else:
            # Standard full file response
            response = FileResponse(open(full_path, 'rb'), content_type=content_type)
            response['Content-Length'] = str(file_size)
            response['Accept-Ranges'] = 'bytes'
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
            'https://imra-learning.vercel.app',
            'http://localhost:5173', 
            'http://localhost:5174'
        ]
        
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Range, Authorization, Content-Type, Origin, Accept'
            response['Access-Control-Expose-Headers'] = 'Content-Range, Accept-Ranges, Content-Length'
            response['Access-Control-Allow-Credentials'] = 'true'

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
