using AutoMapper;
using ImageSharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PrezentacjaAF.Data;
using PrezentacjaAF.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Controllers
{
    [Authorize]
    [RequireHttps]
    public class SlidesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IHostingEnvironment _env;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;

        public SlidesController(ApplicationDbContext context, IHostingEnvironment env, IMapper mapper, ILogger<SlidesController> logger)
        {
            _context = context;
            _env = env;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: Slides
        public async Task<IActionResult> Index()
        {
            return View(_mapper.Map<List<SlideViewModel>>(await _context.Slides
                .OrderBy(c => c.SortOrder).ToListAsync()));
        }

        // GET: Slides/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Slides/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(SlideViewModel slide)
        {
            VerifyDirs();

            if (slide.PhotoFile == null)
                ModelState.AddModelError("PhotoFile", "File is not uploaded.");
            else if (Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpg" &&
                Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpeg")
                ModelState.AddModelError("PhotoFile", "Wrong file extension.");

            if (slide.MusicFile == null)
                ModelState.AddModelError("MusicFile", "File is not uploaded.");
            else if (Path.GetExtension(slide.MusicFile.FileName).ToLower() != ".mp3")
                ModelState.AddModelError("MusicFile", "Wrong file extension.");

            if (ModelState.IsValid)
            {
                string photoDir = "";
                string musicDir = "";
                if (slide.PhotoFile.Length > 0)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(slide.PhotoFile.FileName);
                    photoDir = _env.WebRootPath + @"\uploads\photos\" + fileName;
                    using (var stream = new FileStream(photoDir, FileMode.Create))
                    {
                        await slide.PhotoFile.CopyToAsync(stream);
                    }
                    using (Image<Rgba32> image = Image.Load(photoDir))
                    {
                        int width, height;
                        CalcImageDims(image.Width, image.Height, out width, out height);
                        image.Save(photoDir);
                        image.Resize(width, height)
                             .Save(_env.WebRootPath + @"\uploads\photos\thumbs\" + fileName);
                    }
                    slide.PhotoPath = Path.GetFileName(photoDir);
                }

                if (slide.MusicFile.Length > 0)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(slide.PhotoFile.FileName);
                    musicDir = _env.WebRootPath + @"\uploads\music\" + fileName;
                    using (var stream = new FileStream(musicDir, FileMode.Create))
                    {
                        await slide.MusicFile.CopyToAsync(stream);
                    }
                    slide.MusicPath = Path.GetFileName(musicDir);
                }

                foreach (var s in _context.Slides.Where(c => c.SortOrder >= slide.SortOrder))
                {
                    s.SortOrder += 1;
                    _context.Entry(s).State = EntityState.Modified;
                }

                _context.Add(_mapper.Map<Slide>(slide));
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(slide);
        }

        // GET: Slides/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var slide = await _context.Slides.SingleOrDefaultAsync(m => m.ID == id);
            if (slide == null)
            {
                return NotFound();
            }

            return View(_mapper.Map<SlideViewModel>(slide));
        }

        // POST: Slides/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, SlideViewModel slide)
        {
            VerifyDirs();

            //TODO: Have not to add files when editing.
            if (id != slide.ID)
            {
                return NotFound();
            }

            if (slide.PhotoFile != null)
                if (Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpg" &&
                    Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpeg")
                    ModelState.AddModelError("PhotoFile", "Wrong file extension.");

            if (slide.MusicFile != null)
                if (Path.GetExtension(slide.MusicFile.FileName).ToLower() != ".mp3")
                    ModelState.AddModelError("MusicFile", "Wrong file extension.");

            if (ModelState.IsValid)
            {
                string photoDir = "";
                string musicDir = "";
                if (slide.PhotoFile != null && slide.PhotoFile.Length > 0)
                {
                    string fileName = String.IsNullOrWhiteSpace(slide.PhotoPath) ?
                        Guid.NewGuid().ToString() + Path.GetExtension(slide.PhotoFile.FileName) :
                        slide.PhotoPath;
                    photoDir = _env.WebRootPath + @"\uploads\photos\" + fileName;
                    using (var stream = new FileStream(photoDir, FileMode.Create))
                    {
                        await slide.PhotoFile.CopyToAsync(stream);
                    }
                    using (Image<Rgba32> image = Image.Load(photoDir))
                    {
                        int width, height;
                        CalcImageDims(image.Width, image.Height, out width, out height);
                        image.Save(photoDir);
                        image.Resize(width, height)
                             .Save(_env.WebRootPath + @"\uploads\photos\thumbs\" + slide.PhotoPath);
                    }
                }
                if (slide.MusicFile != null && slide.MusicFile.Length > 0)
                {
                    string fileName = String.IsNullOrWhiteSpace(slide.MusicPath) ?
                        Guid.NewGuid().ToString() + Path.GetExtension(slide.MusicFile.FileName) :
                        slide.MusicPath;
                    musicDir = _env.WebRootPath + @"\uploads\music\" + fileName;
                    using (var stream = new FileStream(musicDir, FileMode.Create))
                    {
                        await slide.MusicFile.CopyToAsync(stream);
                    }
                }
                try
                {
                    var editedSlide = await _context.Slides.AsNoTracking().FirstOrDefaultAsync(c => c.ID == slide.ID);
                    if (slide.SortOrder != editedSlide.SortOrder)
                    {
                        if (slide.SortOrder > editedSlide.SortOrder)
                        {
                            foreach (var s in _context.Slides
                                .Where(c =>
                                (c.SortOrder > editedSlide.SortOrder) &&
                                (c.SortOrder <= slide.SortOrder))
                            )
                            {
                                s.SortOrder -= 1;
                                _context.Entry(s).State = EntityState.Modified;
                            }
                        }

                        if (slide.SortOrder < editedSlide.SortOrder)
                        {
                            foreach (var s in _context.Slides
                                .Where(c =>
                                (c.SortOrder < editedSlide.SortOrder) &&
                                (c.SortOrder >= slide.SortOrder)))
                            {
                                s.SortOrder += 1;
                                _context.Entry(s).State = EntityState.Modified;
                            }
                        }
                    }
                    if (slide.PhotoFile != null && string.IsNullOrWhiteSpace(slide.PhotoPath))
                        slide.PhotoPath = Path.GetFileName(photoDir);
                    if (slide.MusicFile != null && string.IsNullOrWhiteSpace(slide.MusicPath))
                        slide.MusicPath = Path.GetFileName(musicDir);

                    _context.Update(_mapper.Map<Slide>(slide));
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SlideExists(_mapper.Map<Slide>(slide).ID))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction("Index");
            }
            return View(slide);
        }

        // GET: Slides/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var slide = await _context.Slides
                .SingleOrDefaultAsync(m => m.ID == id);

            if (slide == null)
            {
                return NotFound();
            }

            return View(_mapper.Map<SlideViewModel>(slide));
        }

        // POST: Slides/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var slide = await _context.Slides.SingleOrDefaultAsync(m => m.ID == id);

            if (!string.IsNullOrWhiteSpace(slide.PhotoPath))
            {
                DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\photos\", slide.PhotoPath));
                DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\photos\thumbs\", slide.PhotoPath));
            }
            if (!string.IsNullOrWhiteSpace(slide.MusicPath))
                DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\music\", slide.MusicPath));

            foreach (var s in _context.Slides.Where(c => c.SortOrder > slide.SortOrder))
            {
                s.SortOrder -= 1;
                _context.Entry(s).State = EntityState.Modified;
            }

            _context.Slides.Remove(slide);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        private bool SlideExists(int id)
        {
            return _context.Slides.Any(e => e.ID == id);
        }

        private void DeleteFile(string dir)
        {
            if (System.IO.File.Exists(dir))
                System.IO.File.Delete(dir);
        }

        private void VerifyDirs()
        {
            if (!System.IO.Directory.Exists( _env.WebRootPath + @"\uploads\photos\"))
                System.IO.Directory.CreateDirectory(_env.WebRootPath + @"\uploads\photos\");
            if (!System.IO.Directory.Exists(_env.WebRootPath + @"\uploads\photos\thumbs\"))
                System.IO.Directory.CreateDirectory(_env.WebRootPath + @"\uploads\photos\thumbs\");
            if (!System.IO.Directory.Exists(_env.WebRootPath + @"\uploads\music"))
                System.IO.Directory.CreateDirectory(_env.WebRootPath + @"\uploads\music\");
        }

        private void CalcImageDims(int imageWidth, int imageHeight, out int width, out int height)
        {
            const int size = 50;
            if (imageWidth > imageHeight)
            {
                width = size;
                height = Convert.ToInt32(imageHeight * size / (double)imageWidth);
            }
            else
            {
                width = Convert.ToInt32(imageWidth * size / (double)imageHeight);
                height = size;
            }
        }

    }
}
