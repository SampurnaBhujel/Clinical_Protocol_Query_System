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

        return {
            id: source.id ?? index + 1,
            label: `[${source.id ?? index + 1}] ${source.source || 'Unknown'} - p.${source.page || '?'}`,
            excerpt: source.excerpt || ''
        }
    })
}

export default function ResponseCard({ answer = '', sources = [] }) {
    const normalizedSources = normalizeSources(sources)

    return (
        <article className="message-bubble assistant-message">
            <div className="answer-text">
                {answer.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00a0'}</p>
                ))}
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
