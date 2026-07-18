// Solo Advertiser — Rider App
// SCR-RDR-043: Documents Screen
// View uploaded documents with status (approved, pending, rejected)
// Option to re-upload rejected documents

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-043: Documents Management
/// Lists all uploaded documents with their verification status
class DocumentsScreen extends ConsumerWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Documents')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _DocumentItem(name: 'Driving License (Front)', status: 'approved'),
          _DocumentItem(name: 'Driving License (Back)', status: 'approved'),
          _DocumentItem(name: 'RC Book', status: 'approved'),
          _DocumentItem(name: 'Insurance Certificate', status: 'pending'),
          _DocumentItem(name: 'Vehicle Photo (Front)', status: 'approved'),
          _DocumentItem(name: 'Vehicle Photo (Side)', status: 'rejected'),
        ],
      ),
    );
  }
}

class _DocumentItem extends StatelessWidget {
  final String name;
  final String status;

  const _DocumentItem({super.key, required this.name, required this.status});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(_icon, color: _color),
        title: Text(name),
        subtitle: Text(status.toUpperCase(), style: TextStyle(color: _color, fontSize: 12)),
        trailing: status == 'rejected'
            ? TextButton(onPressed: () {}, child: const Text('Re-upload'))
            : null,
      ),
    );
  }

  IconData get _icon {
    switch (status) {
      case 'approved': return Icons.check_circle;
      case 'pending': return Icons.schedule;
      case 'rejected': return Icons.cancel;
      default: return Icons.description;
    }
  }

  Color get _color {
    switch (status) {
      case 'approved': return Colors.green;
      case 'pending': return Colors.orange;
      case 'rejected': return Colors.red;
      default: return Colors.grey;
    }
  }
}
