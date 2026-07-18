// Solo Advertiser — Rider App
// SCR-RDR-042: Vehicle Details Screen
// View and edit vehicle information (make, model, registration, photos)
// Shows current wrap status

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-042: Vehicle Details
/// Displays and allows editing of vehicle information
class VehicleDetailsScreen extends ConsumerWidget {
  const VehicleDetailsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vehicle Details')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Vehicle photo
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(child: Text('Vehicle Photo')),
          ),
          const SizedBox(height: 24),
          _InfoRow(label: 'Type', value: 'Car'),
          _InfoRow(label: 'Make', value: 'Maruti'),
          _InfoRow(label: 'Model', value: 'Swift'),
          _InfoRow(label: 'Year', value: '2022'),
          _InfoRow(label: 'Registration', value: 'KA 01 AB 1234'),
          _InfoRow(label: 'Color', value: 'White'),
          const Divider(height: 32),
          Text('Wrap Status', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Card(
            color: Colors.green.shade50,
            child: const ListTile(
              leading: Icon(Icons.check_circle, color: Colors.green),
              title: Text('Wrap Installed'),
              subtitle: Text('Brand XYZ — Full vehicle wrap'),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
