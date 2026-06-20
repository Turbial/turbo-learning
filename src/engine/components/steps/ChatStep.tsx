// ─── ChatStep — AI chat window for learners to inquire and explore ───
// Sends messages to an LLM endpoint and streams responses.
// The learner can ask questions related to the lesson context.

import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from "react-native";
import { StepProps } from "../../stepRegistry";
import type { ChatStep as ChatStepType } from "../../types";
import { supabase } from "../../../data/supabase";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function ChatStep({ step, onAnswer, onContinue, state }: StepProps) {
  const s = step as ChatStepType;

  const contextSystemPrompt = s.systemPrompt ?? buildContextPrompt(state.lessonTitle);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: s.greeting ?? "Hi! I'm your AI learning assistant. Ask me anything about what you're learning today." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setInteracted(true);

    try {
      const response = await callLLM(contextSystemPrompt, [...messages, userMsg]);
      const assistantMsg: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble responding. Try again?" },
      ]);
    } finally {
      setLoading(false);
      // Scroll to bottom
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages, s.systemPrompt]);

  const handleDone = () => {
    onAnswer({ interacted, messageCount: messages.filter((m) => m.role === "user").length });
  };

  return (
    <View style={styles.container}>
      {/* Chat messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.bubbleLabel}>
              {msg.role === "user" ? "You" : "🤖 AI Assistant"}
            </Text>
            <Text style={styles.bubbleText}>{msg.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={s.placeholder ?? "Ask about today's lesson..."}
          placeholderTextColor="#C4BDB6"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

      {/* Done button */}
      <TouchableOpacity
        style={styles.doneBtn}
        onPress={handleDone}
        activeOpacity={0.8}
      >
        <Text style={styles.doneBtnText}>
          {interacted ? "Done chatting →" : "Skip →"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Context prompt builder ───

function buildContextPrompt(lessonTitle?: string): string {
  const topic = lessonTitle ? `"${lessonTitle}"` : "today's lesson";
  return `You are a helpful AI learning assistant supporting a learner who is currently studying ${topic}. Your role is to:
- Answer questions about concepts covered in this lesson
- Give practical examples related to the topic
- Encourage and clarify when the learner is confused
- Keep answers concise and conversational (2-4 sentences unless more detail is needed)
- Stay focused on the lesson topic; gently redirect off-topic questions back

Be warm, encouraging, and practical. Avoid jargon.`;
}

// ─── LLM call — proxied through Supabase Edge Function ───

async function callLLM(
  systemPrompt: string | undefined,
  history: Message[],
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("chat", {
    body: { messages: history, systemPrompt },
  });

  if (error) throw error;
  return data?.choices?.[0]?.message?.content ?? "No response from AI.";
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { flex: 1 },
  chatContent: { padding: 12, gap: 8, paddingBottom: 8 },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#059669",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FDFBF8",
    borderWidth: 1,
    borderColor: "#e8e2d9",
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
    color: "#a0a0a0",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2D241C",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    alignSelf: "flex-start",
  },
  typingText: { fontSize: 13, color: "#A09484", fontStyle: "italic" },
  inputArea: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e8e2d9",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#FDFBF8",
    borderWidth: 1,
    borderColor: "#e0d9cf",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 20,
    color: "#3D3228",
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  doneBtn: {
    padding: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e8e2d9",
  },
  doneBtnText: { fontSize: 16, fontWeight: "700", color: "#059669" },
});
