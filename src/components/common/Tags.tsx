import { css } from "@emotion/css";
import { Link } from "react-router-dom";

export const Tags: React.FC<{ tags: string[]; onClick?: () => void }> = ({
  onClick,
  tags,
}) => {
  return (
    <ul
      className={css`
        margin-bottom: 1rem;
      `}
    >
      {tags.map((tag) => (
        <li
          key={tag}
          className={css`
            display: inline-block;
            background-color: white;
            padding: 0.25rem 0.4rem 0.25rem;
            margin-right: 0.25rem;
            margin-bottom: 0.25rem;
          `}
        >
          <Link to={`/tag/${tag}`} onClick={onClick}>
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Tags;
