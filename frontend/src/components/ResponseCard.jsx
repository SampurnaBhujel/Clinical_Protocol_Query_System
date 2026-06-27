// frontend/src/components/ResponseCard.jsx

import ReactMarkdown from 'react-markdown'
import Icon from './Icon'

function normalizeSources(sources) {
    return (sources || []).map((source, index) => {
        if (typeof source === 'string') {
            return {
                id: index + 1,
                label: source,
                excerpt: ''
            }
        }

        const section = source.heading_path || source.subsection || source.section || ''
        const document = source.document || source.source || 'Unknown'
        const page = source.page || '?'

        return {
            id: source.id ?? index + 1,
            // label: `[${source.id ?? index + 1}] ${document} - p.${page}${section ? ` - ${section}` : ''}`,
            label: `[${source.id ?? index + 1}] ${document} - p.${page}`,
            excerpt: source.excerpt || ''
        }
    })
}

export default function ResponseCard({ answer = '', sources = [], confidence = '' }) {
    const normalizedSources = normalizeSources(sources)

    return (
        // <article className="message-bubble assistant-message">
        //     <div className="answer-text">
        //         {answer.split('\n').map((line, index) => (
        //             <p key={index}>{line || '\u00a0'}</p>
        //         ))}
        //     </div>
        <article className="message-bubble assistant-message">
            {confidence && (
                <div className={`confidence-badge ${confidence.toLowerCase()}`}>
                    Confidence: {confidence}
                </div>
            )}
            <div className="answer-text">
                <ReactMarkdown>
                    {answer}
                </ReactMarkdown>
            </div>

            {normalizedSources.length > 0 && (
                <div className="source-list">
                    <div className="source-list-title">
                        <Icon name="fileText" size={16} />
                        Sources
                    </div>
                    {normalizedSources.map(source => (
                        <div className="source-item" key={`${source.id}-${source.label}`}>
                            <strong>{source.label}</strong>
                            {source.excerpt && <span>{source.excerpt}</span>}
                        </div>
                    ))}
                </div>
            )}
        </article>
    )
}
