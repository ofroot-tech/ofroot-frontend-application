import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode } from 'react';
import styles from './MotionText.module.css';

type Props = { children: ReactNode; trigger?: 'load' | 'view' | 'bar'; delay?: number; className?: string };

/** Keep the original text, spaces, and line breaks in the server-rendered heading. */
export default function MotionText({ children, trigger = 'view', delay = 0, className = '' }: Props) {
  let order = 0;
  const splitWords = (nodes: ReactNode): ReactNode => Children.map(nodes, node => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map(part => {
        if (!part || /^\s+$/.test(part)) return part;
        const index = order++;
        return <span key={index} className={styles.word} style={{ '--word-order': index } as CSSProperties}>{part}</span>;
      });
    }
    if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
      return cloneElement(node, undefined, splitWords(node.props.children));
    }
    return node;
  });

  return <span className={`${styles.text} ${styles[trigger]} ${className}`} data-motion-text={trigger} style={{ '--text-delay': `${delay}ms` } as CSSProperties}>
    {splitWords(children)}
  </span>;
}
