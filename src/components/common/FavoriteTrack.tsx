import { css } from "@emotion/css";
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { addTrackToUserFavorites } from "../../services/Api";
import IconButton from "./IconButton";

export const spinner = css`
  @keyframes spinning {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  > svg {
    position: relative;
    animation-name: spinning;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
    /* linear | ease | ease-in | ease-out | ease-in-out */
    animation-timing-function: linear;
  }
`;

export const SpinningStar: React.FC<{ spinning: boolean; full: boolean }> = ({
  spinning,
  full,
}) => {
  return (
    <div className={spinning ? spinner : ""}>
      {full && <FaStar />}
      {!full && <FaRegStar />}
    </div>
  );
};

export const FavoriteTrack: React.FC<{ track: TrackWithUserCounts }> = ({
  track,
}) => {
  const [isFavorite, setIsFavorite] = React.useState(track.favorite);
  const [loadingFavorite, setLoadingFavorite] = React.useState(false);

  const onClickStar = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      setLoadingFavorite(true);

      await addTrackToUserFavorites(track.id);
      setIsFavorite((val) => !val);
      setLoadingFavorite(false);
    },
    [track.id]
  );
  return (
    <IconButton compact onClick={onClickStar}>
      <SpinningStar spinning={loadingFavorite} full={isFavorite} />
    </IconButton>
  );
};
