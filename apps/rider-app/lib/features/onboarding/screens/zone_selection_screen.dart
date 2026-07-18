// Solo Advertiser — Rider App
// SCR-RDR-008: Zone Selection Screen
// Map-based zone picker for rider's primary driving area
// Part of onboarding wizard step 4

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';

/// SCR-RDR-008: Zone Selection
/// Rider selects their primary operating zone on a map
/// Zones determine which campaigns they're eligible for
class ZoneSelectionScreen extends ConsumerStatefulWidget {
  const ZoneSelectionScreen({super.key});

  @override
  ConsumerState<ZoneSelectionScreen> createState() => _ZoneSelectionScreenState();
}

class _ZoneSelectionScreenState extends ConsumerState<ZoneSelectionScreen> {
  String? _selectedZone;

  final List<Map<String, String>> _zones = [
    {'id': 'zone-1', 'name': 'Central Business District'},
    {'id': 'zone-2', 'name': 'North Suburbs'},
    {'id': 'zone-3', 'name': 'South Suburbs'},
    {'id': 'zone-4', 'name': 'East Industrial'},
    {'id': 'zone-5', 'name': 'West Residential'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Zone'),
        actions: [Text('Step 4/5', style: Theme.of(context).textTheme.bodySmall)],
      ),
      body: Column(
        children: [
          // Map placeholder (Google Maps widget in production)
          Container(
            height: 200,
            color: Colors.grey.shade200,
            child: const Center(child: Text('Map View — Zone boundaries')),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _zones.length,
              itemBuilder: (context, index) {
                final zone = _zones[index];
                return RadioListTile<String>(
                  value: zone['id']!,
                  groupValue: _selectedZone,
                  title: Text(zone['name']!),
                  onChanged: (v) => setState(() => _selectedZone = v),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _selectedZone != null
                  ? () => context.push(AppRoutes.onboardingComplete)
                  : null,
              child: const Text('Confirm Zone'),
            ),
          ),
        ],
      ),
    );
  }
}
