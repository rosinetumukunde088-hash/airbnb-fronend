import { memo, useCallback } from "react";
import clsx from "clsx";
import { format, parseISO } from "date-fns";
import numeral from "numeral";
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Listing } from "../types";
import { useFavorites } from "../hooks/useFavorites";
import styles from "./ListingCard.module.css";

interface Props {
  listing: Listing;
}

const ListingCard = memo(({ listing }: Props) => {
  const { title, location, price, rating, superhost, available, availableFrom, img, id } = listing;
  const { toggle, isSaved } = useFavorites();
  const saved = isSaved(id);

  const handleToggle = useCallback(() => toggle(id, title), [id, title, toggle]);

  return (
    <motion.div
      className={clsx(styles.card, {
        [styles.saved]: saved,
        [styles.luxury]: price > 300,
        [styles.booked]: !available,
        [styles.superhost]: superhost,
      })}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/listings/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className={styles.imgWrap}>
          <img src={img} alt={title} className={styles.img} />
          {superhost && <span className={styles.superhostBadge}>Superhost</span>}
          {price > 300 && <span className={styles.luxuryBadge}>Luxury</span>}
        </div>
      </Link>

      <div className={styles.body}>
        <Link to={`/listings/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        <p className={styles.location}>
          <FaMapMarkerAlt className={styles.icon} />
          {location}
        </p>

        <div className={styles.meta}>
          <span className={styles.rating}>
            <FaStar className={clsx(styles.icon, styles.iconStar)} />
            {numeral(rating).format("0.00")}
          </span>
          <span className={clsx(styles.status, { [styles.statusBooked]: !available })}>
            {available ? "Available" : "Booked"}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{numeral(price).format("$0,0")} <small>/night</small></span>
          <span className={styles.date}>From {format(parseISO(availableFrom), "MMM d, yyyy")}</span>
        </div>

        <button className={styles.heart} onClick={handleToggle}>
          {saved ? <FaHeart color="#ff385c" /> : <FaRegHeart color="#888" />}
        </button>
      </div>
    </motion.div>
  );
});

ListingCard.displayName = "ListingCard";

export default ListingCard;
