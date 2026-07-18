// Solo Advertiser — Rider App
// SCR-RDR-009: Onboarding Completion Screen
// Shows success state and what happens next (review process)
// Final step of onboarding wizard

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';

/// SCR-RDR-009: Onboarding Complete
/// Confirms submission and explains the review process
class CompletionScreen extends StatelessWidget {
  const CompletionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, size: 100, color: Color(0xFF10B981)),
              const SizedBox(height: 24),
              Text('Application Submitted!',
                  style: Theme.of(context).textTheme.headlineMedium,
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text(
                'Our team will review your documents within 24-48 hours. '
                'You\'ll receive a notification once approved.',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // What happens next
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _StepItem(number: '1', text: 'Document verification (24-48h)'),
                      _StepItem(number: '2', text: 'Vehicle inspection scheduled'),
                      _StepItem(number: '3', text: 'Wrap installation'),
                      _StepItem(number: '4', text: 'Start earning!'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => context.go(AppRoutes.home),
                child: const Text('Go to Dashboard'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepItem extends StatelessWidget {
  final String number;
  final String text;

  const _StepItem({required this.number, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(radius: 12, child: Text(number, style: const TextStyle(fontSize: 12))),
          const SizedBox(width: 12),
          Text(text),
        ],
      ),
    );
  }
}
