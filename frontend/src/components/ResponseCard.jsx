// frontend/src/components/ResponseCard.jsx

// Renders the assistant's answer with source citations above it
export default function ResponseCard({ answer, sources }) {
    return (
        <div className="bubble assistant-bubble">
            {/* Source citations */}
            {sources && sources.length > 0 && (
                <p className="sources-line">
                    📄 {sources.join(' · ')}
                </p>
            )}
            {/* Answer text with newline support */}
            <div className="answer-text">
                {answer.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        <br />
                    </span>
                ))}
            </div>
        </div>
    )
}