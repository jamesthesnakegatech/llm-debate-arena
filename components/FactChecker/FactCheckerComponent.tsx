// components/FactChecker/FactCheckerComponent.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Loader2, 
  Info,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { FactClaim, FactCheckResult } from './types';
import { OpenAIFactCheckService } from '@/services/factCheckService';

interface FactCheckerProps {
  messages: Array<{
    id: string;
    speaker: string;
    content: string;
    timestamp: Date;
  }>;
  apiKey: string;
  searchApiKey?: string;
  onFactCheckComplete?: (result: FactCheckResult) => void;
  className?: string;
  autoCheckDelay?: number; // Delay in ms before auto-checking new messages
}

export const FactChecker: React.FC<FactCheckerProps> = ({
  messages,
  apiKey,
  searchApiKey,
  onFactCheckComplete,
  className = '',
  autoCheckDelay = 2000
}) => {
  const [service] = useState(() => new OpenAIFactCheckService(apiKey, searchApiKey));
  const [checkingClaims, setCheckingClaims] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, FactCheckResult>>(new Map());
  const [autoCheck, setAutoCheck] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [selectedResult, setSelectedResult] = useState<FactCheckResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [minClaimLength, setMinClaimLength] = useState(30);
  const autoCheckTimerRef = useRef<NodeJS.Timeout>();

  // Extract claims from messages with improved logic
  const extractClaims = useCallback((message: typeof messages[0]): FactClaim[] => {
    // Improved sentence extraction with better regex
    const sentences = message.content.match(/[^.!?]+[.!?]+/g) || [];
    
    return sentences
      .map(s => s.trim())
      .filter(s => {
        // Filter out very short sentences and questions
        if (s.length < minClaimLength) return false;
        if (s.endsWith('?')) return false; // Skip questions
        
        // Skip sentences that are likely opinions or personal statements
        const opinionIndicators = ['i think', 'i believe', 'in my opinion', 'personally'];
        const lowerSentence = s.toLowerCase();
        if (opinionIndicators.some(indicator => lowerSentence.includes(indicator))) {
          return false;
        }
        
        return true;
      })
      .map((sentence, idx) => ({
        id: `${message.id}-${idx}`,
        text: sentence,
        speaker: message.speaker,
        timestamp: message.timestamp,
        messageId: message.id,
        context: message.content
      }));
  }, [minClaimLength]);

  const checkClaim = useCallback(async (claim: FactClaim) => {
    setCheckingClaims(prev => new Set(prev).add(claim.id));
    
    try {
      const result = await service.checkClaim(claim);
      setResults(prev => new Map(prev).set(claim.id, result));
      
      if (onFactCheckComplete) {
        onFactCheckComplete(result);
      }
    } catch (error) {
      console.error('Failed to check claim:', error);
      // Store error result
      setResults(prev => new Map(prev).set(claim.id, {
        claimId: claim.id,
        verdict: 'unverifiable',
        confidence: 0,
        explanation: 'Error occurred while checking this claim.',
        sources: [],
        checkTimestamp: new Date()
      }));
    } finally {
      setCheckingClaims(prev => {
        const next = new Set(prev);
        next.delete(claim.id);
        return next;
      });
    }
  }, [service, onFactCheckComplete]);

  // Auto-check new messages with debouncing
  useEffect(() => {
    if (!autoCheck || messages.length === 0) return;

    // Clear existing timer
    if (autoCheckTimerRef.current) {
      clearTimeout(autoCheckTimerRef.current);
    }

    // Set new timer
    autoCheckTimerRef.current = setTimeout(() => {
      const latestMessage = messages[messages.length - 1];
      const claims = extractClaims(latestMessage);
      
      claims.forEach(claim => {
        if (!results.has(claim.id) && !checkingClaims.has(claim.id)) {
          checkClaim(claim);
        }
      });
    }, autoCheckDelay);

    return () => {
      if (autoCheckTimerRef.current) {
        clearTimeout(autoCheckTimerRef.current);
      }
    };
  }, [messages, autoCheck, extractClaims, results, checkingClaims, checkClaim, autoCheckDelay]);

  const getVerdictIcon = (verdict: FactCheckResult['verdict']) => {
    switch (verdict) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'false': return <XCircle className="w-4 h-4" />;
      case 'partially-true': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getVerdictColor = (verdict: FactCheckResult['verdict']) => {
    switch (verdict) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'false': return 'text-red-600 bg-red-50 border-red-200';
      case 'partially-true': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const checkAllClaims = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const claims = extractClaims(message);
    for (const claim of claims) {
      if (!results.has(claim.id) && !checkingClaims.has(claim.id)) {
        await checkClaim(claim);
        // Add small delay between checks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Fact Checker
          </h3>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={(e) => setAutoCheck(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="select-none">Auto-check</span>
            </label>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <label className="block text-sm">
              <span className="text-gray-700">Minimum claim length:</span>
              <input
                type="number"
                value={minClaimLength}
                onChange={(e) => setMinClaimLength(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                min="10"
                max="100"
              />
            </label>
          </div>
        )}
      </div>

      {/* Messages and Claims */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages to fact-check yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map(message => {
              const claims = extractClaims(message);
              const isExpanded = expandedMessages.has(message.id);
              const hasResults = claims.some(claim => results.has(claim.id));
              const isChecking = claims.some(claim => checkingClaims.has(claim.id));

              if (claims.length === 0) return null;

              return (
                <div key={message.id} className="border rounded-lg overflow-hidden">
                  {/* Message Header */}
                  <div 
                    className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleMessageExpansion(message.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.speaker}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {claims.length} claim{claims.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(hasResults || isChecking) && (
                          <div className="flex items-center gap-1">
                            {isChecking && <Loader2 className="w-3 h-3 animate-spin" />}
                            {hasResults && (
                              <>
                                {['verified', 'false', 'partially-true', 'unverifiable'].map(verdict => {
                                  const count = claims.filter(c => 
                                    results.get(c.id)?.verdict === verdict
                                  ).length;
                                  if (count === 0) return null;
                                  
                                  return (
                                    <span 
                                      key={verdict}
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        verdict === 'verified' ? 'bg-green-100 text-green-700' :
                                        verdict === 'false' ? 'bg-red-100 text-red-700' :
                                        verdict === 'partially-true' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {count}
                                    </span>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        )}
                        
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Claims List (Expandable) */}
                  {isExpanded && (
                    <div className="p-3 space-y-2 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600 italic">"{message.content}"</p>
                        {claims.some(c => !results.has(c.id) && !checkingClaims.has(c.id)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              checkAllClaims(message.id);
                            }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Check All
                          </button>
                        )}
                      </div>
                      
                      {claims.map((claim, idx) => {
                        const result = results.get(claim.id);
                        const isCheckingClaim = checkingClaims.has(claim.id);

                        return (
                          <div key={claim.id} className="flex items-start gap-2 p-2 rounded border border-gray-200">
                            <span className="text-xs text-gray-400 mt-1">{idx + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                {claim.text}
                              </p>
                              
                              {result && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => setSelectedResult(result)}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getVerdictColor(result.verdict)} hover:opacity-80 transition-opacity`}
                                  >
                                    {getVerdictIcon(result.verdict)}
                                    <span className="capitalize">{result.verdict.replace('-', ' ')}</span>
                                    <span className="opacity-75">({Math.round(result.confidence * 100)}%)</span>
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {!result && (
                              <button
                                onClick={() => checkClaim(claim)}
                                disabled={isCheckingClaim}
                                className={`text-xs px-3 py-1 rounded transition-colors ${
                                  isCheckingClaim
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isCheckingClaim ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Check'
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fact Check Result Modal */}
      {selectedResult && (
        <FactCheckResultModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

// Fact Check Result Modal Component
const FactCheckResultModal: React.FC<{
  result: FactCheckResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fact Check Details</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${
              result.verdict === 'verified' ? 'text-green-600 bg-green-50 border-green-200' :
              result.verdict === 'false' ? 'text-red-600 bg-red-50 border-red-200' :
              result.verdict === 'partially-true' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
              'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
              {result.verdict === 'verified' && <CheckCircle className="w-4 h-4" />}
              {result.verdict === 'false' && <XCircle className="w-4 h-4" />}
              {result.verdict === 'partially-true' && <AlertCircle className="w-4 h-4" />}
              {result.verdict === 'unverifiable' && <Info className="w-4 h-4" />}
              <span className="capitalize">{result.verdict.replace('-', ' ')}</span>
              <span className="text-xs opacity-75">({Math.round(result.confidence * 100)}% confidence)</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Analysis</h4>
            <p className="text-gray-700">{result.explanation}</p>
          </div>
          
          {result.sources.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Sources</h4>
              <div className="space-y-3">
                {result.sources.map((source, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h5 className="font-medium text-sm mb-1">{source.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{source.snippet}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Relevance: {Math.round(source.relevance * 100)}%
                      </span>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            Checked at {result.checkTimestamp.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
