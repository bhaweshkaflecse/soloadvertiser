// Solo Advertiser — Rider App
// SCR-RDR-012: Verification Photo Capture Screen
// Camera interface for capturing daily/weekly wrap verification photos
// Includes guide overlay showing expected photo angle

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-012: Verification Photo Capture
/// Rider takes photos of vehicle wrap as proof of active display
/// Required periodically per campaign compliance rules
class VerificationCaptureScreen extends ConsumerStatefulWidget {
  const VerificationCaptureScreen({super.key});

  @override
  ConsumerState<VerificationCaptureScreen> createState() => _VerificationCaptureScreenState();
}

class _VerificationCaptureScreenState extends ConsumerState<VerificationCaptureScreen> {
  int _capturedPhotos = 0;
  static const _requiredPhotos = 3; // Front, Side, Back

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verification Photos')),
      body: Column(
        children: [
          // Camera preview placeholder
          Expanded(
            flex: 3,
            child: Container(
              color: Colors.black87,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.camera_alt, size: 80, color: Colors.white54),
                    const SizedBox(height: 16),
                    Text(
                      _getPhotoInstruction(),
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Progress and capture button
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text('Photo $_capturedPhotos of $_requiredPhotos'),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(value: _capturedPhotos / _requiredPhotos),
                  const SizedBox(height: 16),
                  FloatingActionButton(
                    onPressed: _capturePhoto,
                    child: const Icon(Icons.camera),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getPhotoInstruction() {
    switch (_capturedPhotos) {
      case 0: return 'Take photo of FRONT of vehicle';
      case 1: return 'Take photo of LEFT SIDE';
      case 2: return 'Take photo of BACK';
      default: return 'All photos captured!';
    }
  }

  void _capturePhoto() {
    setState(() => _capturedPhotos++);
    if (_capturedPhotos >= _requiredPhotos) {
      // Submit verification photos
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification photos submitted!')),
      );
      Navigator.of(context).pop();
    }
  }
}
