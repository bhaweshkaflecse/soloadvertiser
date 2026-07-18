// Solo Advertiser — Rider App
// SCR-RDR-007: Document Upload Screen
// Upload driving license, RC book, insurance, and vehicle photos
// Part of onboarding wizard step 3

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';

/// SCR-RDR-007: Document Upload
/// Required documents: Driving License, RC Book, Insurance, Vehicle Photos
class DocumentUploadScreen extends ConsumerWidget {
  const DocumentUploadScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Documents'),
        actions: [Text('Step 3/5', style: Theme.of(context).textTheme.bodySmall)],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Upload Required Documents',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('Clear photos of originals required',
                style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            _DocumentTile(label: 'Driving License (Front)', uploaded: false),
            _DocumentTile(label: 'Driving License (Back)', uploaded: false),
            _DocumentTile(label: 'RC Book', uploaded: false),
            _DocumentTile(label: 'Insurance Certificate', uploaded: false),
            _DocumentTile(label: 'Vehicle Photo (Front)', uploaded: false),
            _DocumentTile(label: 'Vehicle Photo (Side)', uploaded: false),
            const Spacer(),
            ElevatedButton(
              onPressed: () => context.push(AppRoutes.zoneSelection),
              child: const Text('Next'),
            ),
          ],
        ),
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final String label;
  final bool uploaded;

  const _DocumentTile({required this.label, required this.uploaded});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(uploaded ? Icons.check_circle : Icons.upload_file,
            color: uploaded ? Colors.green : Colors.grey),
        title: Text(label),
        trailing: uploaded
            ? const Text('Done', style: TextStyle(color: Colors.green))
            : const Icon(Icons.camera_alt),
        onTap: () {/* Open document capture */},
      ),
    );
  }
}
