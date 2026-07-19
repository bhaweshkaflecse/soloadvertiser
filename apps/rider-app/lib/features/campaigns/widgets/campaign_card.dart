// Solo Advertiser — Rider App
// Campaign card widget for list display
// Shows brand name, duration, rate, and status chip

import 'package:flutter/material.dart';

/// Campaign card displaying summary info in a list
class CampaignCard extends StatelessWidget {
  final String campaignId;
  final VoidCallback? onTap;

  const CampaignCard({super.key, required this.campaignId, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Brand logo placeholder
              Container(
                width: 50, height: 50,
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.campaign, color: Colors.blue),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Brand Campaign', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('₹500/day • 30 days', style: TextStyle(color: Colors.grey.shade600)),
                  ],
                ),
              ),
              Chip(
                label: const Text('Active', style: TextStyle(fontSize: 12)),
                backgroundColor: Colors.green.shade100,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
