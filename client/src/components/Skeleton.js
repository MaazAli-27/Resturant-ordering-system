import React from 'react';
import './Skeleton.css';

export const MenuCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image" />
    <div className="skeleton-body">
      <div className="skeleton-row">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-price" />
      </div>
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc short" />
      <div className="skeleton skeleton-btn" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => <MenuCardSkeleton key={i} />)}
  </div>
);
