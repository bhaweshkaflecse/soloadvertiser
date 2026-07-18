// Solo Advertiser — Rider App
// SCR-RDR-011: Notification Center Screen
// Lists push notifications: campaign assignments, payment updates, system alerts
// Grouped by date with read/unread indicators

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-011: Notification Center
/// Shows all notifications grouped by date with read/unread state
class NotificationCenterScreen extends ConsumerWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(onPressed: () {/* Mark all as read */}, child: const Text('Mark all read')),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 10, // Placeholder count
        itemBuilder: (context, index) {
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: index < 3 ? Colors.blue.shade100 : Colors.grey.shade100,
                child: Icon(
                  _getNotificationIcon(index),
                  color: index < 3 ? Colors.blue : Colors.grey,
                ),
              ),
              title: Text('Notification Title #$index'),
              subtitle: const Text('Notification description goes here'),
              trailing: Text('${index}h ago', style: Theme.of(context).textTheme.bodySmall),
              onTap: () {/* Navigate to relevant screen */},
            ),
          );
        },
      ),
    );
  }

  IconData _getNotificationIcon(int index) {
    final icons = [Icons.campaign, Icons.payment, Icons.info, Icons.verified];
    return icons[index % icons.length];
  }
}
