// Solo Advertiser — Rider App
// SCR-RDR-020: Campaign List Screen
// Shows available and active campaigns for the rider
// Filterable by status (available, active, completed)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../widgets/campaign_card.dart';
import '../../shared/widgets/bottom_nav_bar.dart';

/// SCR-RDR-020: Campaign List
/// Displays campaigns grouped by status: Active, Available, Completed
class CampaignListScreen extends ConsumerStatefulWidget {
  const CampaignListScreen({super.key});

  @override
  ConsumerState<CampaignListScreen> createState() => _CampaignListScreenState();
}

class _CampaignListScreenState extends ConsumerState<CampaignListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campaigns'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Available'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Active campaigns
          _buildCampaignList(status: 'active'),
          // Available campaigns
          _buildCampaignList(status: 'available'),
          // Completed campaigns
          _buildCampaignList(status: 'completed'),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 1),
    );
  }

  Widget _buildCampaignList({required String status}) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5, // Placeholder
      itemBuilder: (context, index) {
        return CampaignCard(
          campaignId: 'campaign-$index',
          onTap: () => context.push('/campaigns/campaign-$index'),
        );
      },
    );
  }
}
