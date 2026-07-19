// Solo Advertiser — Rider App
// SCR-RDR-041: Edit Personal Information Screen
// Editable fields for name, email, phone, address, and profile photo
// Pre-populated with existing rider data

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-041: Edit Personal Info
/// Allows rider to update their personal details
class EditPersonalInfoScreen extends ConsumerStatefulWidget {
  const EditPersonalInfoScreen({super.key});

  @override
  ConsumerState<EditPersonalInfoScreen> createState() => _EditPersonalInfoScreenState();
}

class _EditPersonalInfoScreenState extends ConsumerState<EditPersonalInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'John Doe');
  final _emailController = TextEditingController(text: 'john@example.com');
  final _addressController = TextEditingController(text: '123 Main St');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Personal Info'),
        actions: [
          TextButton(onPressed: _save, child: const Text('Save')),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Profile photo
              Center(
                child: Stack(
                  children: [
                    const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
                    Positioned(
                      bottom: 0, right: 0,
                      child: CircleAvatar(
                        radius: 16,
                        child: IconButton(
                          icon: const Icon(Icons.camera_alt, size: 16),
                          onPressed: () {},
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name')),
              const SizedBox(height: 16),
              TextFormField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
              const SizedBox(height: 16),
              TextFormField(controller: _addressController, decoration: const InputDecoration(labelText: 'Address'), maxLines: 2),
              const SizedBox(height: 16),
              // Phone is read-only (linked to auth)
              TextFormField(
                initialValue: '+91 9876543210',
                enabled: false,
                decoration: const InputDecoration(labelText: 'Phone (cannot be changed)'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _save() {
    if (_formKey.currentState!.validate()) {
      // TODO: Call API to update profile
      Navigator.of(context).pop();
    }
  }
}
