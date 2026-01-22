"use client";

import { useState, useRef, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";

import { GetUptimeDto } from '@/infraestructure/interfaces';
import MenuDropdownCardUptime from "./MenuDropdownCardUptime";
import "./CardUptime.scss"

interface Props {
    uptimes: GetUptimeDto
}

const CardUptime = ({ uptimes }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const setUptimes = (open: boolean) => {
    setIsMenuOpen(open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="card-uptime">
      <div className="card-uptime-container">
        <div className="status-icon-content-main">
          <div className="container-icon">
            <FaCircle className='icon' />
          </div>
          <div className="url-request-date">
            <div className="text-url">
              <p> {uptimes.name} </p>
            </div>
            <div className="request-date">
              <span className="text-protocol"> HTTP </span>
              <span className="text-date"> {new Date(uptimes.createdAt || "").toISOString().split("T")[0]} </span>
            </div>
          </div>
        </div>
        <div className="more-data">
          <div className="reload-frequency">
            <IoReload className="icon" />
            <span> {uptimes.frequency}/segundos </span>
          </div>
          <div
            ref={menuRef}
            className="more"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <IoIosMore className="icon-more" />

            {isMenuOpen && (
              <MenuDropdownCardUptime
                isMenuOpen={isMenuOpen}
                setUptimes={setUptimes}
                setIsMenuOpen={setIsMenuOpen}
                uptimes={uptimes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardUptime;
