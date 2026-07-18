// Solo Advertiser — Rider App
// SCR-RDR-010: Home / Dashboard Screen
// Shows earnings summary, active campaign, action required banners
// Primary screen after login with bottom navigation

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/bottom_nav_bar.dart';
import '../widgets/dashboard_card.dart';
import '../widgets/earnings_summary.dart';
import '../widgets/action_required_banner.dart';

/// SCR-RDR-010: Home Dashboard
/// Displays: Today's earnings, active campaign status, action items, quick stats
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Badge(child: Icon(Icons.notifications_outlined)),
            onPressed: () {/* Navigate to notifications */},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {/* Pull-to-refresh dashboard data */},
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            // Action required banner (verification photos, etc.)
            ActionRequiredBanner(),
            SizedBox(height: 16),
            // Today's earnings summary card
            EarningsSummary(),
            SizedBox(height: 16),
            // Active campaign card
            DashboardCard(
              title: 'Active Campaign',
              subtitle: 'Brand XYZ — Wrap installed',
              icon: Icons.campaign,
              color: Color(0xFF10B981),
            ),
            SizedBox(height: 12),
            // Availability status card
            DashboardCard(
              title: 'Status',
              subtitle: 'Available — Tracking active',
              icon: Icons.gps_fixed,
              color: Color(0xFF3B82F6),
            ),
            SizedBox(height: 12),
            // Km driven today
            DashboardCard(
              title: 'Distance Today',
              subtitle: '45.2 km tracked',
              icon: Icons.timeline,
              color: Color(0xFFF59E0B),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 0),
    );
  }
}
