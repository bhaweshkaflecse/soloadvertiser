// Solo Advertiser — Rider App
// Action required banner widget for home screen
// Shows when rider needs to take an action (e.g., verification photo)

import 'package:flutter/material.dart';

/// Banner displayed when rider has pending actions
/// Examples: verification photo due, document expiring, new campaign available
class ActionRequiredBanner extends StatelessWidget {
  const ActionRequiredBanner({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: Conditionally display based on pending actions
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7), // Amber 100
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF59E0B)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Verification Photo Due',
                    style: Theme.of(context).textTheme.titleSmall),
                const Text('Take your weekly wrap verification photo'),
              ],
            ),
          ),
          TextButton(
            onPressed: () {/* Navigate to verification capture */},
            child: const Text('Take Now'),
          ),
        ],
      ),
    );
  }
}
