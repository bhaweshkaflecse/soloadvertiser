// Solo Advertiser — Rider App
// Bottom navigation bar shared across main screens
// 4 tabs: Home, Campaigns, Earnings, Profile

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Shared bottom navigation bar for main app sections
class BottomNavBar extends StatelessWidget {
  final int currentIndex;

  const BottomNavBar({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: (index) {
        switch (index) {
          case 0: context.go('/home');
          case 1: context.go('/campaigns');
          case 2: context.go('/earnings');
          case 3: context.go('/profile');
        }
      },
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.campaign_outlined), selectedIcon: Icon(Icons.campaign), label: 'Campaigns'),
        NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Earnings'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
      ],
    );
  }
}
