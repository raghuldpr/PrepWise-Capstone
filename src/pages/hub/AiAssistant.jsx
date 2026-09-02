import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  askAiQuestion,
  getAiConversations,
  getAiConversationById,
  deleteAiConversation
} from '../../services/aiService';
import { getAiErrorMessage } from '../../utils/aiErrorUtils';
import CareerHubHeader from '../../components/hub/CareerHubHeader';
import FormattedMarkdown from '../../components/common/FormattedMarkdown';

export default function AiAssistant() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingConversations, setFetchingConversations] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const starterPrompts = [
    {
      title: "Project Explanation",
      prompt: "How should I structure the explanation of my final year project in a technical interview?"
    },
    {
      title: "System Design Basics",
      prompt: "What are the most essential System Design concepts to master for SDE-1 campus placements?"
    },
    {
      title: "TCS / Infosys Aptitude",
      prompt: "Give me a quick 3-step strategy to crack quantitative aptitude for IT services company hiring."
    },
    {
      title: "Mock HR Answer",
      prompt: "How do I answer 'What is your biggest weakness?' effectively without sounding cliché?"
    }
  ];

  // Fetch all user conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      setFetchingConversations(true);
      const data = await getAiConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setFetchingConversations(false);
    }
  };

  const handleSelectConversation = async (convId) => {
    try {
      setError(null);
      setLoading(true);
      setCurrentConversationId(convId);
      const conv = await getAiConversationById(convId);
      if (conv && conv.messages) {
        setMessages(conv.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to fetch conversation details:", err);
      setError("Unable to load chat history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await deleteAiConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Could not delete conversation. Please try again.");
    }
  };

  const lastQuestionRef = useRef('');

  const handleSendMessage = async (textToSend) => {
    const questionText = textToSend || inputQuestion || lastQuestionRef.current;
    if (!questionText || !questionText.trim()) return;

    lastQuestionRef.current = questionText.trim();

    setError(null);
    const userMessageObj = {
      id: Date.now(),
      role: 'user',
      messageText: questionText.trim(),
      createdAt: new Date().toISOString()
    };

    // Append user message immediately
    setMessages(prev => [...prev, userMessageObj]);
    setInputQuestion('');
    setLoading(true);

    try {
      const payload = {
        question: questionText.trim(),
        conversationId: currentConversationId
      };

      const res = await askAiQuestion(payload);

      if (res && res.reply) {
        const aiMessageObj = {
          id: Date.now() + 1,
          role: 'assistant',
          messageText: res.reply,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessageObj]);

        if (res.conversationId) {
          setCurrentConversationId(res.conversationId);
        }

        // Refresh conversation sidebar list
        loadConversations();
      } else {
        throw new Error("Received empty response from AI assistant");
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      setError(getAiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 font-body pb-12">
      <CareerHubHeader />

      <div className="min-h-[calc(100vh-9rem)] flex flex-col md:flex-row bg-[#121212] text-white rounded-2xl overflow-hidden border border-[#2A2A2A] shadow-2xl font-body">
      {/* Sidebar - Past Conversations */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-80 flex' : 'hidden md:hidden'
        } flex-col bg-[#181818] border-r border-[#2A2A2A] transition-all duration-200 z-10`}
      >
        {/* Sidebar Top Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C85232] flex items-center justify-center text-white font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-heading tracking-tight text-white">AI Placement Assistant</h2>
              <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">24/7 AI Tutor</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2A2A2A]"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C85232] hover:bg-[#B34528] text-white font-semibold text-sm transition-all shadow-md active:scale-98"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Past Discussions
          </div>

          {fetchingConversations ? (
            <div className="p-4 text-center text-xs text-neutral-500 space-y-2">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Loading history...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
              <p>No chat history yet.</p>
              <p className="text-[11px] mt-1 text-neutral-600">Start a new conversation to ask questions!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = currentConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-[#2A2A2A] text-white font-medium border border-neutral-700'
                      : 'text-neutral-400 hover:bg-[#222222] hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                    <MessageSquare size={15} className={isSelected ? 'text-[#C85232]' : 'text-neutral-500'} />
                    <span className="truncate">{conv.title || 'Placement Inquiry'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col bg-[#121212] relative overflow-hidden">
        {/* Workspace Top Bar */}
        <div className="p-4 bg-[#181818] border-b border-[#2A2A2A] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
                title="Open Sidebar"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C85232] to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm font-heading text-white">Placement Assistant AI</h1>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready to help with DSA, System Design, HR & Resume
              </p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="text-xs bg-[#222222] hover:bg-[#2A2A2A] border border-[#333333] text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border border-[#2E2E2E] flex items-center justify-center text-[#C85232] mb-4 shadow-lg">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2 text-white">How can I assist your placement prep today?</h2>
              <p className="text-xs text-neutral-400 mb-8 leading-relaxed">
                Ask anything about technical interviews, DSA logic, core CS concepts, resume bullet points, or company-specific hiring rounds.
              </p>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {starterPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl bg-[#1E1E1E] hover:bg-[#282828] border border-[#2E2E2E] hover:border-[#3E3E3E] transition-all text-left group"
                  >
                    <p className="text-xs font-bold text-[#C85232] mb-1 group-hover:text-amber-400 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                      isUser
                        ? 'bg-neutral-800 border border-neutral-700'
                        : 'bg-gradient-to-tr from-[#C85232] to-amber-600'
                    }`}
                  >
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  {/* Message Content Bubble */}
                  <div
                    className={`relative group rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#C85232] text-white rounded-tr-none'
                        : 'bg-[#1E1E1E] text-neutral-200 border border-[#2A2A2A] rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap font-body font-normal">
                        {msg.messageText}
                      </div>
                    ) : (
                      <FormattedMarkdown content={msg.messageText} />
                    )}

                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-[10px] text-neutral-500">
                        <span>AI Assistant</span>
                        <button
                          onClick={() => copyToClipboard(msg.messageText, index)}
                          className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                          title="Copy message"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#C85232] to-amber-600 flex items-center justify-center text-white shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl rounded-tl-none p-4 text-xs text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C85232] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] ml-2 text-neutral-500">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors shrink-0"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Pinned at Bottom */}
        <div className="p-3 sm:p-4 bg-[#181818] border-t border-[#2A2A2A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#121212] border border-[#2A2A2A] focus-within:border-[#C85232] rounded-xl p-2 transition-colors"
          >
            <textarea
              ref={inputRef}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a placement question (e.g., 'Explain binary search space reduction' or 'Resume review tips')..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none resize-none px-2 py-1 max-h-32 min-h-[38px]"
            />

            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="w-10 h-10 rounded-lg bg-[#C85232] hover:bg-[#B34528] disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold flex items-center justify-center transition-all shrink-0 shadow-md active:scale-95"
              title="Send Question"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-neutral-500">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span className="hidden sm:inline">Powered by Gemini AI Engine</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
