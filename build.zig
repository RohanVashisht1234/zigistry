const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{
        .preferred_optimize_mode = std.builtin.OptimizeMode.ReleaseFast,
    });
    // Helper Functions Library
    const helperFunctions = b.addModule("helperFunctions", .{
        .root_source_file = b.path("scripts/libs/functionsProvider.zig"),
        .target = target,
        .optimize = optimize,
    });

    // Database Compiler
    {
        const databaseCompiler = b.addExecutable(.{
            .name = "databaseCompiler",
            .root_source_file = b.path("scripts/databaseCompiler.zig"),
            .target = target,
            .optimize = optimize,
        });
        databaseCompiler.root_module.addImport("helperFunctions", helperFunctions);
        b.installArtifact(databaseCompiler);

        const databaseCompilerRunCmd = b.addRunArtifact(databaseCompiler);
        databaseCompilerRunCmd.step.dependOn(b.getInstallStep());
        if (b.args) |args| {
            databaseCompilerRunCmd.addArgs(args);
        }
        const databaseCompilerRunStep = b.step("run_databaseCompiler", "Run database compiler");
        databaseCompilerRunStep.dependOn(&databaseCompilerRunCmd.step);
    }
    // Repo List Compressor
    {
        const repoListCompressor = b.addExecutable(.{
            .name = "repoListCompressor",
            .root_source_file = b.path("scripts/repoListCompressor.zig"),
            .target = target,
            .optimize = optimize,
        });
        repoListCompressor.root_module.addImport("helperFunctions", helperFunctions);
        b.installArtifact(repoListCompressor);

        const repoListCompressorRunCmd = b.addRunArtifact(repoListCompressor);
        repoListCompressorRunCmd.step.dependOn(b.getInstallStep());
        if (b.args) |args| {
            repoListCompressorRunCmd.addArgs(args);
        }
        const repoListCompressorRunStep = b.step("run_repoListCompressor", "Run repoListCompressor");
        repoListCompressorRunStep.dependOn(&repoListCompressorRunCmd.step);
    }
    // Helper Functions Unit Tests
    {
        const functionsProviderUnitTests = b.addTest(.{
            .root_source_file = b.path("scripts/libs/functionsProvider.zig"),
            .target = target,
            .optimize = optimize,
        });
        const runFunctionsProviderUnitTests = b.addRunArtifact(functionsProviderUnitTests);
        const functionsProviderTestStep = b.step("run_testlib", "Run helperFunctions lib tests");
        functionsProviderTestStep.dependOn(&runFunctionsProviderUnitTests.step);
    }
}
