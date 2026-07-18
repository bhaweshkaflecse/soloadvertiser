// Solo Advertiser — Rider App
// SCR-RDR-045: Support Conversation Screen
// Chat-style interface for individual support ticket
// Shows message history and allows sending new messages

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-045: Support Conversation
/// Chat-style interface for communicating with support team
class SupportConversationScreen extends ConsumerStatefulWidget {
  final String ticketId;

  const SupportConversationScreen({super.key, required this.ticketId});

  @override
  ConsumerState<SupportConversationScreen> createState() => _SupportConversationScreenState();
}

class _SupportConversationScreenState extends ConsumerState<SupportConversationScreen> {
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Ticket #${widget.ticketId}')),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: const [
                _MessageBubble(text: 'Hi, I have an issue with my wrap.', isMe: true),
                _MessageBubble(text: 'Hello! Could you describe the issue?', isMe: false),
                _MessageBubble(text: 'The wrap has a small tear on the left side.', isMe: true),
              ],
            ),
          ),
          // Input area
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
            ),
            child: Row(
              children: [
                IconButton(icon: const Icon(Icons.attach_file), onPressed: () {}),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(icon: const Icon(Icons.send), onPressed: () {}),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String text;
  final bool isMe;

  const _MessageBubble({required this.text, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF1E40AF) : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(text, style: TextStyle(color: isMe ? Colors.white : Colors.black87)),
      ),
    );
  }
}
