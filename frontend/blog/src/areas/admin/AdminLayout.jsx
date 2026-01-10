// src/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="container-fluid py-3">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-12 col-md-3 col-lg-2 mb-3 mb-md-0">
          <div className="card shadow-sm">
            <div className="card-header fw-bold">
              <i className="fa fa-user-shield me-2" />
              Admin Paneli
            </div>

            <NavLink
              to="/"
              className={({ isActive }) =>
                'list-group-item list-group-item-action' + (isActive ? ' active' : '')
              }
            >
              <i className="fa fa-tags me-2" />
              Anasayfa
            </NavLink>

            <div className="list-group list-group-flush">
              <NavLink
                to="/admin/blog-category"
                className={({ isActive }) =>
                  'list-group-item list-group-item-action' + (isActive ? ' active' : '')
                }
              >
                <i className="fa fa-tags me-2" />
                Blog Kategorileri
              </NavLink>


              <NavLink
                  to="/admin/blog"
                  className={({ isActive }) =>
                      'list-group-item list-group-item-action' + (isActive ? ' active' : '')
                  }
              >
                <i className="fa fa-tags me-2" />
                Blog
              </NavLink>

              <NavLink
                to="/admin/about"
                className={({ isActive }) =>
                  'list-group-item list-group-item-action' + (isActive ? ' active' : '')
                }
              >
                <i className="fa fa-tags me-2" />
                About
              </NavLink>

              {/* gelecekte başka admin sayfaları:
              <NavLink to="/admin/posts" className={({isActive}) => 'list-group-item list-group-item-action' + (isActive ? ' active' : '')}>
                <i className="fa fa-file-alt me-2" /> Yazılar
              </NavLink>
              */}
            </div>
          </div>
        </aside>

        {/* İçerik */}
        <main className="col-12 col-md-9 col-lg-10">
          <div className="card shadow-sm">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
