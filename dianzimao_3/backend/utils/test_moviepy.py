#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys

print("Python version:", sys.version)
print("Python executable:", sys.executable)

try:
    import moviepy
    print("Moviepy version:", moviepy.__version__)
    print("Moviepy location:", moviepy.__file__)
    
    from moviepy.editor import VideoFileClip
    print("✓ Successfully imported VideoFileClip!")
except ImportError as e:
    print("✗ Import error:", e)
    print("Trying alternative imports...")
    
    try:
        from moviepy.video.io.VideoFileClip import VideoFileClip
        print("✓ Successfully imported VideoFileClip from moviepy.video.io!")
    except Exception as e2:
        print("✗ Alternative import also failed:", e2)
except Exception as e:
    print("✗ Unexpected error:", e)
