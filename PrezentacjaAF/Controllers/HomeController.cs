using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PrezentacjaAF.Models;
using PrezentacjaAF.Data;
using Microsoft.AspNetCore.Hosting;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace PrezentacjaAF.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IHostingEnvironment _env;
        private readonly IMapper _mapper;

        public HomeController(ApplicationDbContext context, IHostingEnvironment env, IMapper mapper)
        {
            _context = context;
            _env = env;
            _mapper = mapper;
        }

        public async Task<IActionResult> Index()
        {
            return View(_mapper.Map<List<SlideViewModel>>(await _context.Slides.
                OrderBy(c => c.SortOrder).ToListAsync()));
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
