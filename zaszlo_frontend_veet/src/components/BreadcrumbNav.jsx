import React from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Link } from "react-router-dom";

const BreadcrumbNav = ({ items }) => {
  return (
    <Breadcrumb className="px-3 pt-3">
      {items.map((item, index) => (
        item.active ? (
          <Breadcrumb.Item active key={index}>{item.label}</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={index}>
            <Link to={item.to}>{item.label}</Link>
          </Breadcrumb.Item>
        )
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
