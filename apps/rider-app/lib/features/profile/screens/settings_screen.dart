// Solo Advertiser — Rider App
// SCR-RDR-046: Settings Screen
// App preferences: notifications, language, dark mode, privacy
// Includes app version info and legal links

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-046: App Settings
/// Notification preferences, theme, language, and app information
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          // Notifications section
          _SectionHeader(title: 'Notifications'),
          SwitchListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Campaign updates and payments'),
            value: true,
            onChanged: (v) {},
          ),
          SwitchListTile(
            title: const Text('Email Notifications'),
            value: false,
            onChanged: (v) {},
          ),
          // Appearance
          _SectionHeader(title: 'Appearance'),
          ListTile(
            title: const Text('Theme'),
            subtitle: const Text('System default'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Language'),
            subtitle: const Text('English'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          // Legal
          _SectionHeader(title: 'Legal'),
          ListTile(title: const Text('Privacy Policy'), onTap: () {}),
          ListTile(title: const Text('Terms of Service'), onTap: () {}),
          // App info
          _SectionHeader(title: 'App'),
          const ListTile(
            title: Text('Version'),
            subtitle: Text('1.0.0 (Build 1)'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(title, style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Colors.grey)),
    );
  }
}
