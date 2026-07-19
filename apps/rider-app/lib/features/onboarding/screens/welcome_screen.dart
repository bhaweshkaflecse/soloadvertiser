// Solo Advertiser — Rider App
// SCR-RDR-004: Welcome / Onboarding Intro Screen
// Shows benefits of joining, app features overview
// Navigates to personal info step

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';

/// SCR-RDR-004: Welcome Screen
/// Introduces the rider to the platform and starts onboarding flow
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.local_shipping, size: 80, color: Color(0xFF1E40AF)),
              const SizedBox(height: 24),
              Text('Earn While You Drive',
                  style: Theme.of(context).textTheme.headlineMedium,
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text(
                'Transform your vehicle into a moving billboard and earn passive income on every trip.',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Benefits list
              _BenefitItem(icon: Icons.attach_money, text: 'Earn up to ₹15,000/month'),
              _BenefitItem(icon: Icons.schedule, text: 'Flexible — drive on your schedule'),
              _BenefitItem(icon: Icons.verified, text: 'Professional wrap installation'),
              const Spacer(),
              ElevatedButton(
                onPressed: () => context.push(AppRoutes.personalInfo),
                child: const Text('Get Started'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BenefitItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _BenefitItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF10B981)),
          const SizedBox(width: 12),
          Text(text, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
