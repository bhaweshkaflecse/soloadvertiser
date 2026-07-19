// Solo Advertiser — Rider App
// Onboarding state management
// Tracks progress through the 5-step onboarding wizard

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Onboarding wizard step tracking
enum OnboardingStep { welcome, personalInfo, vehicle, documents, zoneSelection, complete }

/// Onboarding state with collected data
class OnboardingState {
  final OnboardingStep currentStep;
  final Map<String, dynamic> personalInfo;
  final Map<String, dynamic> vehicleInfo;
  final List<String> uploadedDocuments;
  final String? selectedZoneId;
  final bool isSubmitting;

  const OnboardingState({
    this.currentStep = OnboardingStep.welcome,
    this.personalInfo = const {},
    this.vehicleInfo = const {},
    this.uploadedDocuments = const [],
    this.selectedZoneId,
    this.isSubmitting = false,
  });

  OnboardingState copyWith({
    OnboardingStep? currentStep,
    Map<String, dynamic>? personalInfo,
    Map<String, dynamic>? vehicleInfo,
    List<String>? uploadedDocuments,
    String? selectedZoneId,
    bool? isSubmitting,
  }) {
    return OnboardingState(
      currentStep: currentStep ?? this.currentStep,
      personalInfo: personalInfo ?? this.personalInfo,
      vehicleInfo: vehicleInfo ?? this.vehicleInfo,
      uploadedDocuments: uploadedDocuments ?? this.uploadedDocuments,
      selectedZoneId: selectedZoneId ?? this.selectedZoneId,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }

  double get progress => currentStep.index / OnboardingStep.values.length;
}

/// Provider for onboarding wizard state
final onboardingProvider = StateProvider<OnboardingState>((ref) {
  return const OnboardingState();
});
