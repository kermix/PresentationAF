using AutoMapper;
using SixLabors.ImageSharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using PrezentacjaAF.Data;
using PrezentacjaAF.Models.SlideViewModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace PrezentacjaAF.Controllers
{
    enum FileType
    {
        MUSIC,
        PHOTO
    }
    [RequireHttps]
    [Authorize]
    public class SlidesController : DefaultController
    {
        private readonly IStringLocalizer<SlidesController> _localizer;

        public SlidesController(
            ApplicationDbContext context,
            IHostingEnvironment env,
            IMapper mapper,
            IStringLocalizer<SlidesController> localizer)
                : base(context, env, mapper)
        {
            _localizer = localizer;
        }

        // GET: Slides
        public async Task<IActionResult> Index()
        {
            return View(_mapper.Map<List<IndexViewModel>>(await _context.Slides
                .Include(s => s.Section)
                .OrderBy(c => c.SortOrder)
                .ToListAsync()));
        }

        // GET: Slides/Create
        public async Task<IActionResult> Create()
        {
            PrezentacjaAF.Models.Slide slide = await (_context.Slides.OrderByDescending(c => c.SortOrder).FirstOrDefaultAsync());
            ViewData["Section"] = new SelectList(_context.Sections, "Id", "Name");
            ViewData["SortOrder"] = slide != null ? (slide.SortOrder + 1).ToString() : "1";
            return View();
        }

        // POST: Slides/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateEditViewModel slide)
        {
            if (slide.PhotoFile == null) ModelState.AddModelError("PhotoFile", _localizer["File is not uploaded."]);
            else if (Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpg" &&
                        Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpeg")
                ModelState.AddModelError("PhotoFile", _localizer["Wrong file extension."]);

            if (slide.MusicFile != null && Path.GetExtension(slide.MusicFile.FileName).ToLower() != ".mp3")
                ModelState.AddModelError("MusicFile", _localizer["Wrong file extension."]);

            if (ModelState["SortOrder"].Errors.Count > 0)
            {
                ModelState["SortOrder"].Errors.Clear();
                ModelState["SortOrder"].Errors.Add(_localizer["Value is wrong."]);
            }

            if (ModelState.IsValid)
            {
                slide.PhotoPath = await UploadFile(slide.PhotoFile, FileType.PHOTO);
                if (slide.MusicFile != null)
                    slide.MusicPath = await UploadFile(slide.MusicFile, FileType.MUSIC);
                else
                {
                    slide.SlideLength = 30;
                    slide.MusicPath = @"silence.mp3";
                }
                slide.Title = NormalizeTitle(slide.Title);

                MoveSortOrder(slide.SortOrder, slide.SectionId, Direction.UP);

                _context.Add(_mapper.Map<PrezentacjaAF.Models.Slide>(slide));
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["Section"] = new SelectList(_context.Sections, "Id", "Name", slide.SectionId);
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
            ViewData["Section"] = new SelectList(_context.Sections, "Id", "Name", slide.SectionId);
            return View(_mapper.Map<CreateEditViewModel>(slide));
        }

        // POST: Slides/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, CreateEditViewModel slide)
        {
            if (id != slide.ID)
            {
                return NotFound();
            }

            if (slide.PhotoFile != null && Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpg" &&
                Path.GetExtension(slide.PhotoFile.FileName).ToLower() != ".jpeg")
                ModelState.AddModelError("PhotoFile", _localizer["Wrong file extension."]);

            if (slide.MusicFile != null)
                if (Path.GetExtension(slide.MusicFile.FileName).ToLower() != ".mp3")
                    ModelState.AddModelError("MusicFile", _localizer["Wrong file extension."]);

            if (ModelState["SortOrder"].Errors.Count > 0)
            {
                ModelState["SortOrder"].Errors.Clear();
                ModelState["SortOrder"].Errors.Add(_localizer["Value is wrong."]);
            }

            if (ModelState.IsValid)
            {
                if (slide.PhotoFile != null)
                {
                    DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\photos\", slide.PhotoPath));
                    DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\photos\thumbs\", slide.PhotoPath));
                    slide.PhotoPath = await UploadFile(slide.PhotoFile, FileType.PHOTO);
                }
                if (slide.MusicFile != null)
                {
                    if(slide.MusicPath != "silence.mp3")
                        DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\music\", slide.MusicPath));
                    slide.MusicPath = await UploadFile(slide.MusicFile, FileType.MUSIC);
                }
                try
                {
                    var editedSlide = _context.Slides.AsNoTracking().FirstOrDefault(c => c.ID == slide.ID);
                    if (slide.SortOrder != editedSlide.SortOrder)
                    {
                        MoveSortOrder(
                            (slide.SortOrder > editedSlide.SortOrder) ? (byte)(slide.SortOrder + 1) : slide.SortOrder, 
                            slide.SectionId, Direction.UP, 
                            slide.ID);
                        MoveSortOrder(editedSlide.SortOrder, slide.SectionId, Direction.DOWN, slide.ID);
                    }
                    slide.Title = NormalizeTitle(slide.Title);
                    _context.Update(_mapper.Map<PrezentacjaAF.Models.Slide>(slide));
                    slide.Title = NormalizeTitle(slide.Title);

                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SlideExists(_mapper.Map<PrezentacjaAF.Models.Slide>(slide).ID))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
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
                .Include(s => s.Section)
                .SingleOrDefaultAsync(m => m.ID == id);

            if (slide == null)
            {
                return NotFound();
            }

            return View(_mapper.Map<DeleteViewModel>(slide));
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
            if (!string.IsNullOrWhiteSpace(slide.MusicPath) && slide.MusicPath != "silence.mp3")
                DeleteFile(System.IO.Path.Combine(_env.WebRootPath + @"\uploads\music\", slide.MusicPath));

            MoveSortOrder(slide.SortOrder, slide.SectionId, Direction.DOWN);

            _context.Slides.Remove(slide);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
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

        private void CalcImageDims(int imageWidth, int imageHeight, out int width, out int height, bool isThumb = false)
        {
            int size = isThumb ? 64 : (imageWidth > imageHeight ? 2048 : 1080);
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

        private async Task<string> UploadFile(IFormFile file, FileType fileType)
        {
            if (file.Length > 0)
            {
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string fileDir = _env.WebRootPath + @"\uploads\" + (fileType == FileType.MUSIC ? "music" : "photos") + "/" + fileName;
                using (var stream = new FileStream(fileDir, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                if (fileType == FileType.PHOTO)
                    PrepareImage(fileDir, true);

                return Path.GetFileName(fileDir);
            }
            return "";
        }

        private void PrepareImage(string photoDir, bool createThumb)
        {
            using (Image<Rgba32> image = Image.Load(photoDir))
            {
                int width, height;
                CalcImageDims(image.Width, image.Height, out width, out height);
                image.Mutate(x => x.Resize(width, height));
                image.Save(photoDir);
                if (createThumb)
                {
                    CalcImageDims(image.Width, image.Height, out width, out height, true);
                    image.Mutate(x => x.Resize(width, height));
                    image.Save(_env.WebRootPath + @"\uploads\photos\thumbs\" + Path.GetFileName(photoDir));
                }
                
            }
        }

        private string NormalizeTitle(string input)
        {
            input.Replace("  ", " ").Replace(" \" ", "\"");
            return Regex.Replace(input, @"^.*?(?=/)", m => m.ToString().ToUpper());
        }

    }
}
