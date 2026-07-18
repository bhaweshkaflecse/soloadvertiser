// Solo Advertiser — Rider App
// SCR-RDR-006: Vehicle Information Screen
// Collects vehicle type, make, model, year, registration number
// Part of onboarding wizard step 2

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';

/// SCR-RDR-006: Vehicle Details Entry
/// Collects: Vehicle type, make, model, year, registration number, color
class VehicleScreen extends ConsumerStatefulWidget {
  const VehicleScreen({super.key});

  @override
  ConsumerState<VehicleScreen> createState() => _VehicleScreenState();
}

class _VehicleScreenState extends ConsumerState<VehicleScreen> {
  final _formKey = GlobalKey<FormState>();
  String _vehicleType = 'car';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Details'),
        actions: [Text('Step 2/5', style: Theme.of(context).textTheme.bodySmall)],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Vehicle type selector
              Text('Vehicle Type', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'car', label: Text('Car'), icon: Icon(Icons.directions_car)),
                  ButtonSegment(value: 'bike', label: Text('Bike'), icon: Icon(Icons.two_wheeler)),
                  ButtonSegment(value: 'auto', label: Text('Auto'), icon: Icon(Icons.electric_rickshaw)),
                ],
                selected: {_vehicleType},
                onSelectionChanged: (v) => setState(() => _vehicleType = v.first),
              ),
              const SizedBox(height: 24),
              TextFormField(decoration: const InputDecoration(labelText: 'Make (e.g. Maruti)')),
              const SizedBox(height: 16),
              TextFormField(decoration: const InputDecoration(labelText: 'Model (e.g. Swift)')),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Year'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextFormField(decoration: const InputDecoration(labelText: 'Registration Number')),
              const SizedBox(height: 16),
              TextFormField(decoration: const InputDecoration(labelText: 'Color')),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    context.push(AppRoutes.documentUpload);
                  }
                },
                child: const Text('Next'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
