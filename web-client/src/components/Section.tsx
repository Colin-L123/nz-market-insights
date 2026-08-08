import '../App.css'
import './Section.css'
export default function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="section-wrapper glass-card">
            <h2 className="section-title">{title}</h2>
            {children}
        </section>
    )
}
