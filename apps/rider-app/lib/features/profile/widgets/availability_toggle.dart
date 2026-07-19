// Solo Advertiser — Rider App
// Availability toggle widget for rider online/offline status
// Controls whether the rider is visible for new campaign assignments

import 'package:flutter/material.dart';

/// Toggle switch for rider availability status
/// When off, rider won't receive new campaign assignments
class AvailabilityToggle extends StatefulWidget {
  const AvailabilityToggle({super.key});

  @override
  State<AvailabilityToggle> createState() => _AvailabilityToggleState();
}

class _AvailabilityToggleState extends State<AvailabilityToggle> {
  bool _isAvailable = true;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: _isAvailable ? Colors.green.shade50 : Colors.grey.shade100,
      child: SwitchListTile(
        title: Text(_isAvailable ? 'Available' : 'Unavailable'),
        subtitle: Text(_isAvailable
            ? 'You can receive campaign assignments'
            : 'You won\'t receive new assignments'),
        value: _isAvailable,
        onChanged: (value) => setState(() => _isAvailable = value),
        secondary: Icon(
          _isAvailable ? Icons.check_circle : Icons.pause_circle,
          color: _isAvailable ? Colors.green : Colors.grey,
        ),
      ),
    );
  }
}
