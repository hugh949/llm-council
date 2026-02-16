import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { APP_VERSION, BUILD_TIME } from '../version';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  currentConversation,
  onSelectConversation,
  onSelectStep,
  onNewConversation,
  onDeleteConversation,
  isCreatingConversation = false,
}) {
  const [conversationDetails, setConversationDetails] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(new Set());
  const [expandedChains, setExpandedChains] = useState(new Set());

  useEffect(() => {
    if (currentConversation && currentConversation.id) {
      setConversationDetails(prev => ({
        ...prev,
        [currentConversation.id]: currentConversation
      }));
    }
  }, [currentConversation]);

  useEffect(() => {
    if (currentConversationId && !conversationDetails[currentConversationId] && !currentConversation) {
      loadConversationDetails(currentConversationId);
    }
  }, [currentConversationId]);

  // Expand chain when selecting a conversation in it
  useEffect(() => {
    if (currentConversationId) {
      const conv = conversations.find(c => c.id === currentConversationId);
      const chainId = conv?.chain_id || conv?.id;
      if (chainId) {
        setExpandedChains(prev => new Set(prev).add(chainId));
      }
    }
  }, [currentConversationId, conversations]);

  const loadConversationDetails = async (convId) => {
    if (loadingConversations.has(convId)) return;
    setLoadingConversations(prev => new Set(prev).add(convId));
    try {
      const details = await api.getConversation(convId);
      setConversationDetails(prev => ({ ...prev, [convId]: details }));
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    } finally {
      setLoadingConversations(prev => {
        const next = new Set(prev);
        next.delete(convId);
        return next;
      });
    }
  };

  const getDetails = (convId) => conversationDetails[convId];
  const isLoading = (convId) => loadingConversations.has(convId);

  const toggleChain = (chainId) => {
    setExpandedChains(prev => {
      const next = new Set(prev);
      if (next.has(chainId)) next.delete(chainId);
      else next.add(chainId);
      return next;
    });
  };

  const handleDeleteClick = (convId, e, chainId) => {
    e.stopPropagation();
    const conv = conversations.find(c => c.id === convId);
    const chainConvs = chainId
      ? conversations.filter(c => (c.chain_id || c.id) === chainId)
      : [conv];
    const title = chainConvs[0]?.title || 'this conversation';
    const msg = chainConvs.length > 1
      ? `Delete all ${chainConvs.length} rounds of "${title}"? This cannot be undone.`
      : `Delete "${title}"? This cannot be undone.`;
    if (window.confirm(msg)) {
      chainConvs.forEach(c => {
        if (onDeleteConversation) onDeleteConversation(c.id);
      });
    }
  };

  // Group by chain_id; sort chains by most recent; sort rounds within chain by round_number
  const chains = useMemo(() => {
    const byChain = {};
    for (const c of conversations) {
      const cid = c.chain_id || c.id;
      if (!byChain[cid]) byChain[cid] = [];
      byChain[cid].push(c);
    }
    for (const arr of Object.values(byChain)) {
      arr.sort((a, b) => (a.round_number || 1) - (b.round_number || 1));
    }
    const entries = Object.entries(byChain);
    entries.sort(([, a], [, b]) => {
      const ta = a[0]?.created_at || '';
      const tb = b[0]?.created_at || '';
      return tb.localeCompare(ta);
    });
    return entries;
  }, [conversations]);

  const getPhaseStatus = (details) => {
    const promptEng = details?.prompt_engineering || {};
    const contextEng = details?.context_engineering || {};
    const councilDelib = details?.council_deliberation || {};
    const prepared = !!(promptEng.finalized_prompt && contextEng.finalized_context);
    const deliberated = councilDelib.messages?.some(msg => msg.role === 'assistant' && msg.stage3) ?? false;
    return { prepared, deliberated };
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/xavorlogo.jpeg" alt="Xavor" className="xavor-logo" />
          <h1 className="app-title">LLM Council <span className="app-version">v{APP_VERSION}</span>{BUILD_TIME && <span className="app-build-time" title="Build time">{BUILD_TIME.slice(0, 10)}</span>}</h1>
        </div>
        <button
          className="new-conversation-btn"
          onClick={onNewConversation}
          disabled={isCreatingConversation}
        >
          {isCreatingConversation ? 'Creating…' : '+ New Conversation'}
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          chains.map(([chainId, rounds]) => {
            const rootTitle = rounds[0]?.title?.replace(/\s*\(Round \d+\)\s*$/, '') || 'New Conversation';
            const isMultiRound = rounds.length > 1;
            const expanded = expandedChains.has(chainId);
            const hasSelected = rounds.some(r => r.id === currentConversationId);

            return (
              <div key={chainId} className={`chain-group ${hasSelected ? 'has-selected' : ''}`}>
                <div
                  className="chain-header"
                  onClick={() => isMultiRound ? toggleChain(chainId) : onSelectConversation(rounds[0].id)}
                >
                  <div className="chain-title-row">
                    {isMultiRound && (
                      <span className="chain-toggle" aria-hidden="true">
                        {expanded ? '▼' : '▶'}
                      </span>
                    )}
                    <div className="chain-title">{rootTitle}</div>
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => handleDeleteClick(rounds[0].id, e, chainId)}
                      title="Delete"
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                  {!isMultiRound && (
                    <div className="chain-meta">{rounds[0].message_count} messages</div>
                  )}
                </div>

                {(!isMultiRound || expanded) && (
                  <div className="chain-rounds">
                    {rounds.map((conv) => {
                      const isSelected = conv.id === currentConversationId;
                      const details = isSelected && currentConversation ? currentConversation : getDetails(conv.id);
                      const loading = isLoading(conv.id);
                      if (isSelected && !details && !loading && !currentConversation) {
                        loadConversationDetails(conv.id);
                      }
                      const { prepared, deliberated } = getPhaseStatus(details);

                      return (
                        <div
                          key={conv.id}
                          className={`round-item ${isSelected ? 'active' : ''}`}
                          onClick={() => onSelectConversation(conv.id)}
                        >
                          <div className="round-label">
                            {rounds.length > 1 ? `Round ${conv.round_number || 1}` : conv.title || 'New Conversation'}
                          </div>
                          <div className="round-phases">
                            <span
                              className={`phase-badge ${prepared ? 'completed' : 'pending'}`}
                              title="Prepare for Council"
                            >
                              {prepared ? '✓' : '·'} Prepare
                            </span>
                            <span
                              className={`phase-badge ${deliberated ? 'completed' : 'pending'}`}
                              title="Council Deliberation"
                            >
                              {deliberated ? '✓' : '·'} Council
                            </span>
                          </div>
                          {loading && <span className="round-loading">...</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
