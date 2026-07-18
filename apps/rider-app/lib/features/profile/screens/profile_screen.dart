// Solo Advertiser — Rider App
// SCR-RDR-040: Profile Screen
// Main profile hub with rider info, availability toggle, and menu items
// Links to edit info, vehicle, documents, support, and settings

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/bottom_nav_bar.dart';
import '../widgets/profile_header.dart';
import '../widgets/availability_toggle.dart';

/// SCR-RDR-040: Profile Overview
/// Hub for all rider profile management features
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const ProfileHeader(),
          const SizedBox(height: 16),
          const AvailabilityToggle(),
          const SizedBox(height: 24),
          _MenuItem(icon: Icons.person, title: 'Personal Info', onTap: () => context.push('/profile/edit')),
          _MenuItem(icon: Icons.directions_car, title: 'Vehicle Details', onTap: () => context.push('/profile/vehicle')),
          _MenuItem(icon: Icons.description, title: 'Documents', onTap: () => context.push('/profile/documents')),
          _MenuItem(icon: Icons.headset_mic, title: 'Support', onTap: () => context.push('/support')),
          _MenuItem(icon: Icons.settings, title: 'Settings', onTap: () => context.push('/settings')),
          const SizedBox(height: 24),
          TextButton.icon(
            onPressed: () {/* Logout */},
            icon: const Icon(Icons.logout, color: Colors.red),
            label: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 3),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
