// Solo Advertiser — Rider App
// SCR-RDR-044: Support Screen
// Lists support tickets and FAQs
// Option to create new support ticket

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// SCR-RDR-044: Support Center
/// Lists existing support tickets and provides access to FAQs
class SupportScreen extends ConsumerWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Quick actions
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('How can we help?', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  ListTile(
                    leading: const Icon(Icons.add_circle_outline),
                    title: const Text('Create New Ticket'),
                    onTap: () {/* Navigate to new ticket */},
                  ),
                  ListTile(
                    leading: const Icon(Icons.help_outline),
                    title: const Text('FAQs'),
                    onTap: () {/* Navigate to FAQ */},
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Recent Tickets', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          // Ticket list
          ...List.generate(3, (index) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              title: Text('Ticket #${1000 + index}'),
              subtitle: Text(index == 0 ? 'Open' : 'Resolved'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/support/ticket-$index'),
            ),
          )),
        ],
      ),
    );
  }
}
