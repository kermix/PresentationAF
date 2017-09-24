using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PrezentacjaAF.Data;
using Microsoft.AspNetCore.Hosting;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace PrezentacjaAF.Controllers
{
    public abstract class DefaultController : Controller
    {
        protected readonly ApplicationDbContext _context;
        protected readonly IHostingEnvironment _env;
        protected readonly IMapper _mapper;

        public DefaultController(ApplicationDbContext context)
        {
            _context = context;
        }
        public DefaultController(
            ApplicationDbContext context,
            IHostingEnvironment env,
            IMapper mapper)
            :this(context)
        {
            _env = env;
            _mapper = mapper;
        }
        protected enum Direction
        {
            UP,
            DOWN
        }
        protected void MoveSortOrder(byte startPoint, int sectionId, Direction direction, int blockedId = 0)
        {
            switch (direction)
            {
                case Direction.UP:
                    foreach (var s in _context.Slides.Where(c =>
                    (c.SectionId == sectionId) &&
                    (c.SortOrder >= startPoint) &&
                    (c.ID != blockedId)))
                    {
                        s.SortOrder += 1;
                        _context.Entry(s).State = EntityState.Modified;
                    }
                    break;
                case Direction.DOWN:
                    foreach (var s in _context.Slides.Where(c =>
                    (c.SectionId == sectionId) &&
                    (c.SortOrder > startPoint) &&
                    (c.ID != blockedId)))
                    {
                        s.SortOrder -= 1;
                        _context.Entry(s).State = EntityState.Modified;
                    }
                    break;
            }
        }  
    }
}